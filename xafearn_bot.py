import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    ContextTypes, MessageHandler, filters
)
from supabase import create_client, Client
from datetime import datetime

# ─── CONFIG ───────────────────────────────────────────────────────────────────
TELEGRAM_TOKEN   = "VOTRE_TOKEN_BOT"
SUPABASE_URL     = "VOTRE_SUPABASE_URL"
SUPABASE_KEY     = "VOTRE_SUPABASE_SERVICE_ROLE_KEY"
ADMIN_IDS        = [123456789]
BOT_USERNAME     = "xafearn_bot"
SUPPORT_USERNAME = "@xafearn_support"

POINTS_PARRAINAGE  = 10
POINTS_MIN_RETRAIT = 1000
TAUX_CONVERSION    = 0.5

WAITING_WALLET       = "waiting_wallet"
ADMIN_WAITING_TASK   = "admin_waiting_task"
ADMIN_WAITING_POINTS = "admin_waiting_points"
ADMIN_WAITING_REJECT = "admin_waiting_reject"

logging.basicConfig(format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_user(tid):
    r = supabase.table("users").select("*").eq("telegram_id", tid).execute()
    return r.data[0] if r.data else None

def create_user(tid, username, full_name, referrer_id=None):
    supabase.table("users").insert({"telegram_id": tid,"username": username or "","full_name": full_name,"points": 0,"referrer_id": referrer_id,"banned": False,"created_at": datetime.utcnow().isoformat()}).execute()

def add_points(tid, pts, reason):
    u = get_user(tid)
    if not u: return
    supabase.table("users").update({"points": u["points"] + pts}).eq("telegram_id", tid).execute()
    supabase.table("transactions").insert({"telegram_id": tid,"points": pts,"reason": reason,"created_at": datetime.utcnow().isoformat()}).execute()

def deduct_points(tid, pts, reason):
    u = get_user(tid)
    if not u or u["points"] < pts: return False
    supabase.table("users").update({"points": u["points"] - pts}).eq("telegram_id", tid).execute()
    supabase.table("transactions").insert({"telegram_id": tid,"points": -pts,"reason": reason,"created_at": datetime.utcnow().isoformat()}).execute()
    return True

def task_done(tid, task_id):
    r = supabase.table("completed_tasks").select("id").eq("telegram_id", tid).eq("task_id", str(task_id)).execute()
    return len(r.data) > 0

def mark_task_done(tid, task_id, pts):
    supabase.table("completed_tasks").insert({"telegram_id": tid,"task_id": str(task_id),"points_earned": pts,"created_at": datetime.utcnow().isoformat()}).execute()

def get_active_tasks():
    return supabase.table("tasks").select("*").eq("active", True).execute().data

def count_refs(tid):
    r = supabase.table("users").select("id", count="exact").eq("referrer_id", tid).execute()
    return r.count or 0

def p2f(pts): return int(pts * TAUX_CONVERSION)
def is_admin(tid): return tid in ADMIN_IDS

def main_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🤝 Parrainage", callback_data="menu_parrainage"),
         InlineKeyboardButton("✅ Tâches", callback_data="menu_taches")],
        [InlineKeyboardButton("💱 Convertir", callback_data="menu_convertir"),
         InlineKeyboardButton("💸 Retirer", callback_data="menu_retirer")],
        [InlineKeyboardButton("🎧 Support", callback_data="menu_support")]
    ])

def admin_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📊 Stats", callback_data="adm_stats"),
         InlineKeyboardButton("💸 Retraits", callback_data="adm_withdrawals")],
        [InlineKeyboardButton("✅ Tâches", callback_data="adm_tasks"),
         InlineKeyboardButton("🎁 Points user", callback_data="adm_points")],
        [InlineKeyboardButton("🏠 Menu principal", callback_data="main_menu")]
    ])

async def send_main_menu(update, pts, name, edit=False):
    text = (f"╔══════════════════════╗\n     💰 *XAFEarn Bot* 💰\n╚══════════════════════╝\n\n"
            f"👋 Bienvenue *{name}* !\n\n💎 Solde : *{pts} points*\n💵 Équivalent : *{p2f(pts)} FCFA*\n\n🔽 Que veux-tu faire ?")
    if edit:
        await update.callback_query.edit_message_text(text, parse_mode="Markdown", reply_markup=main_kb())
    else:
        await update.message.reply_text(text, parse_mode="Markdown", reply_markup=main_kb())

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    args = context.args
    referrer_id = None
    if args and args[0].startswith("ref_"):
        try:
            rid = int(args[0].replace("ref_", ""))
            if rid != user.id and get_user(rid):
                referrer_id = rid
        except ValueError:
            pass
    existing = get_user(user.id)
    if not existing:
        create_user(user.id, user.username, user.full_name, referrer_id)
        if referrer_id:
            add_points(referrer_id, POINTS_PARRAINAGE, f"Parrainage de {user.full_name}")
            try:
                await context.bot.send_message(chat_id=referrer_id,
                    text=f"🎉 *+{POINTS_PARRAINAGE} points !*\n\n👤 *{user.full_name}* a rejoint XAFEarn grâce à toi !",
                    parse_mode="Markdown")
            except Exception: pass
        db_user = get_user(user.id)
    else:
        db_user = existing
    if db_user.get("banned"):
        await update.message.reply_text("🚫 Compte banni. Contacte le support.")
        return
    await send_main_menu(update, db_user["points"], user.first_name)

async def admin_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("🚫 Accès refusé.")
        return
    await update.message.reply_text("🛠️ *Panel Admin XAFEarn*\n\nChoisis une action :", parse_mode="Markdown", reply_markup=admin_kb())

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    user = query.from_user
    db_user = get_user(user.id)

    if not db_user:
        await query.edit_message_text("❌ Utilise /start pour t'inscrire.")
        return
    if db_user.get("banned") and not data.startswith("adm_"):
        await query.edit_message_text("🚫 Compte banni.")
        return

    if data == "main_menu":
        db_user = get_user(user.id)
        await send_main_menu(update, db_user["points"], user.first_name, edit=True)

    elif data == "menu_parrainage":
        link = f"https://t.me/{BOT_USERNAME}?start=ref_{user.id}"
        refs = count_refs(user.id)
        await query.edit_message_text(
            f"🤝 *Parrainage XAFEarn*\n\nGagne *{POINTS_PARRAINAGE} pts* par ami inscrit !\n\n"
            f"🔗 *Ton lien :*\n`{link}`\n\n━━━━━━━━━━━━━━━━\n"
            f"👥 Amis parrainés : *{refs}*\n💰 Points gagnés : *{refs*POINTS_PARRAINAGE} pts*\n━━━━━━━━━━━━━━━━\n\n"
            f"💡 _Partage sur WhatsApp, Facebook, TikTok..._",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")]]))

    elif data == "menu_taches":
        tasks = get_active_tasks()
        if not tasks:
            await query.edit_message_text("✅ *Tâches*\n\nAucune tâche disponible.", parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")]]))
            return
        text = "✅ *Tâches disponibles*\n\n"
        keyboard = []
        for t in tasks:
            done = task_done(user.id, t["id"])
            text += f"{t['emoji']} *{t['title']}* — {t['points']} pts\n_{t['description']}_\n\n"
            keyboard.append([InlineKeyboardButton(
                f"✔️ {t['title']} — Fait" if done else f"{t['emoji']} {t['title']} → +{t['points']} pts",
                callback_data="noop" if done else f"task_{t['id']}")])
        keyboard.append([InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")])
        await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith("task_"):
        task_id = data.replace("task_", "")
        task = next((t for t in get_active_tasks() if str(t["id"]) == task_id), None)
        if not task or task_done(user.id, task_id):
            await query.answer("✔️ Déjà complété !", show_alert=True)
            return
        await query.edit_message_text(
            f"{task['emoji']} *{task['title']}*\n\n📋 {task['description']}\n\n"
            f"1️⃣ Clique *Accomplir*\n2️⃣ Reviens et clique *Vérifier*\n\n🏆 *+{task['points']} pts*",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🔗 Accomplir la tâche", url=task["link"])],
                [InlineKeyboardButton("✅ Vérifier", callback_data=f"verify_{task_id}")],
                [InlineKeyboardButton("⬅️ Retour", callback_data="menu_taches")]]))

    elif data.startswith("verify_"):
        task_id = data.replace("verify_", "")
        task = next((t for t in get_active_tasks() if str(t["id"]) == task_id), None)
        if not task: return
        if task_done(user.id, task_id):
            await query.answer("✔️ Déjà validé !", show_alert=True)
            return
        mark_task_done(user.id, task_id, task["points"])
        add_points(user.id, task["points"], f"Tâche : {task['title']}")
        db_user = get_user(user.id)
        await query.edit_message_text(
            f"🎉 *+{task['points']} points !*\n\n✅ Tâche *{task['title']}* validée !\n\n"
            f"💰 Solde : *{db_user['points']} pts* = *{p2f(db_user['points'])} FCFA*",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("✅ Autres tâches", callback_data="menu_taches"),
                 InlineKeyboardButton("🏠 Menu", callback_data="main_menu")]]))

    elif data == "menu_convertir":
        pts = db_user["points"]
        kb = []
        if pts >= POINTS_MIN_RETRAIT:
            kb.append([InlineKeyboardButton("💸 Retirer maintenant", callback_data="menu_retirer")])
        kb.append([InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")])
        await query.edit_message_text(
            f"💱 *Convertisseur XAFEarn*\n\n💎 Solde : *{pts} pts* = *{p2f(pts)} FCFA*\n\n"
            f"📊 *Tableau :*\n  500 pts   → 250 FCFA\n  1 000 pts → 500 FCFA ✅\n"
            f"  2 000 pts → 1 000 FCFA\n  5 000 pts → 2 500 FCFA\n  10 000 pts → 5 000 FCFA\n\n"
            f"📌 _Min retrait : {POINTS_MIN_RETRAIT} pts_",
            parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(kb))

    elif data == "menu_retirer":
        pts = db_user["points"]
        if pts < POINTS_MIN_RETRAIT:
            await query.edit_message_text(
                f"💸 *Retrait*\n\n❌ Il te manque *{POINTS_MIN_RETRAIT - pts} pts*\n\n"
                f"💎 Solde : *{pts} pts* | 🎯 Minimum : *{POINTS_MIN_RETRAIT} pts*",
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("🤝 Parrainer", callback_data="menu_parrainage"),
                     InlineKeyboardButton("✅ Tâches", callback_data="menu_taches")],
                    [InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")]]))
            return
        await query.edit_message_text(
            f"💸 *Retrait*\n\n💎 Disponible : *{pts} pts = {p2f(pts)} FCFA*\n\nChoisis ta crypto :",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("₿ BTC", callback_data="withdraw_BTC"),
                 InlineKeyboardButton("💲 USDT", callback_data="withdraw_USDT")],
                [InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")]]))

    elif data.startswith("withdraw_"):
        crypto = data.replace("withdraw_", "")
        context.user_data["withdraw_crypto"] = crypto
        context.user_data["withdraw_state"]  = WAITING_WALLET
        pts = db_user["points"]
        await query.edit_message_text(
            f"💸 *Retrait {crypto}*\n\n💎 *{pts} pts = {p2f(pts)} FCFA*\n\n📝 Envoie ton adresse wallet *{crypto}* :",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("❌ Annuler", callback_data="main_menu")]]))

    elif data == "menu_support":
        await query.edit_message_text(
            f"🎧 *Support XAFEarn*\n\n👉 Contacte : {SUPPORT_USERNAME}\n⏰ Lun–Sam, 8h–20h\n\n"
            f"📋 *FAQ :*\n• Retrait sous 24–48h\n• Min retrait : {POINTS_MIN_RETRAIT} pts\n• Problème ? Capture → {SUPPORT_USERNAME}",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Retour", callback_data="main_menu")]]))

    elif data == "noop":
        await query.answer("✔️ Déjà complété !", show_alert=True)

    # ══ ADMIN ═════════════════════════════════════════════════════════════════

    elif data == "adm_menu":
        if not is_admin(user.id): return
        await query.edit_message_text("🛠️ *Panel Admin XAFEarn*", parse_mode="Markdown", reply_markup=admin_kb())

    elif data == "adm_stats":
        if not is_admin(user.id): return
        total_u   = supabase.table("users").select("id", count="exact").execute().count or 0
        pending   = supabase.table("withdrawals").select("id", count="exact").eq("status", "pending").execute().count or 0
        paid      = supabase.table("withdrawals").select("id", count="exact").eq("status", "paid").execute().count or 0
        tasks_n   = supabase.table("tasks").select("id", count="exact").eq("active", True).execute().count or 0
        tx        = supabase.table("transactions").select("points").gt("points", 0).execute().data
        total_pts = sum(t["points"] for t in tx) if tx else 0
        await query.edit_message_text(
            f"📊 *Stats XAFEarn*\n\n👤 Utilisateurs : *{total_u}*\n"
            f"💎 Points distribués : *{total_pts}* = *{p2f(total_pts)} FCFA*\n"
            f"✅ Tâches actives : *{tasks_n}*\n\n💸 *Retraits :*\n  ⏳ En attente : *{pending}*\n  ✅ Payés : *{paid}*",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🔄 Actualiser", callback_data="adm_stats"),
                 InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")]]))

    elif data == "adm_withdrawals":
        if not is_admin(user.id): return
        ws = supabase.table("withdrawals").select("*").eq("status", "pending").order("created_at").limit(5).execute().data
        if not ws:
            await query.edit_message_text("💸 *Retraits en attente*\n\n✅ Aucun retrait en attente !", parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")]]))
            return
        text = f"💸 *Retraits en attente ({len(ws)})*\n\n"
        keyboard = []
        for w in ws:
            text += f"🆔 *#{w['id']}* | 👤 `{w['telegram_id']}`\n💎 {w['points']} pts = *{w['fcfa_equivalent']} FCFA*\n🔐 {w['crypto_type']} : `{w['wallet_address']}`\n📅 {w['created_at'][:10]}\n\n"
            keyboard.append([
                InlineKeyboardButton(f"✅ #{w['id']}", callback_data=f"adm_val_{w['id']}"),
                InlineKeyboardButton(f"❌ #{w['id']}", callback_data=f"adm_rej_{w['id']}")])
        keyboard.append([InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")])
        await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith("adm_val_"):
        if not is_admin(user.id): return
        wid = int(data.replace("adm_val_", ""))
        res = supabase.table("withdrawals").select("*").eq("id", wid).execute()
        if not res.data:
            await query.answer("❌ Introuvable.", show_alert=True)
            return
        w = res.data[0]
        supabase.table("withdrawals").update({"status": "paid"}).eq("id", wid).execute()
        try:
            await context.bot.send_message(chat_id=w["telegram_id"],
                text=f"🎉 *Retrait confirmé !*\n\n💵 *{w['fcfa_equivalent']} FCFA* en *{w['crypto_type']}* envoyés !\n📬 Wallet : `{w['wallet_address']}`\n\nMerci d'utiliser XAFEarn 🙏",
                parse_mode="Markdown")
        except Exception: pass
        await query.answer(f"✅ Retrait #{wid} validé !", show_alert=True)
        # Refresh
        ws2 = supabase.table("withdrawals").select("*").eq("status", "pending").order("created_at").limit(5).execute().data
        if not ws2:
            await query.edit_message_text("💸 *Retraits en attente*\n\n✅ Aucun retrait en attente !", parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")]]))
        else:
            text2 = f"💸 *Retraits en attente ({len(ws2)})*\n\n"
            kb2 = []
            for w2 in ws2:
                text2 += f"🆔 *#{w2['id']}* | 👤 `{w2['telegram_id']}`\n💎 {w2['points']} pts = *{w2['fcfa_equivalent']} FCFA*\n🔐 {w2['crypto_type']} : `{w2['wallet_address']}`\n\n"
                kb2.append([InlineKeyboardButton(f"✅ #{w2['id']}", callback_data=f"adm_val_{w2['id']}"),
                             InlineKeyboardButton(f"❌ #{w2['id']}", callback_data=f"adm_rej_{w2['id']}")])
            kb2.append([InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")])
            await query.edit_message_text(text2, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(kb2))

    elif data.startswith("adm_rej_"):
        if not is_admin(user.id): return
        wid = int(data.replace("adm_rej_", ""))
        context.user_data["admin_reject_id"] = wid
        context.user_data["admin_state"]      = ADMIN_WAITING_REJECT
        await query.edit_message_text(f"❌ *Rejeter le retrait #{wid}*\n\n📝 Envoie la raison du rejet :",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Annuler", callback_data="adm_withdrawals")]]))

    elif data == "adm_tasks":
        if not is_admin(user.id): return
        tasks = supabase.table("tasks").select("*").order("id").execute().data
        text = "✅ *Gestion des tâches*\n\n"
        keyboard = []
        for t in tasks:
            s = "🟢" if t["active"] else "🔴"
            text += f"{s} *{t['title']}* — {t['points']} pts\n"
            keyboard.append([InlineKeyboardButton(
                f"{'🔴 Désactiver' if t['active'] else '🟢 Activer'} : {t['title']}",
                callback_data=f"adm_toggle_{t['id']}")])
        if not tasks: text += "_Aucune tâche._\n"
        keyboard.append([InlineKeyboardButton("➕ Ajouter une tâche", callback_data="adm_add_task")])
        keyboard.append([InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")])
        await query.edit_message_text(text, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith("adm_toggle_"):
        if not is_admin(user.id): return
        tid = int(data.replace("adm_toggle_", ""))
        task = supabase.table("tasks").select("*").eq("id", tid).execute().data
        if task:
            new_s = not task[0]["active"]
            supabase.table("tasks").update({"active": new_s}).eq("id", tid).execute()
            await query.answer(f"{'🟢 Activée' if new_s else '🔴 Désactivée'} !", show_alert=True)
        # Refresh tasks list
        tasks2 = supabase.table("tasks").select("*").order("id").execute().data
        text2 = "✅ *Gestion des tâches*\n\n"
        kb2 = []
        for t in tasks2:
            s = "🟢" if t["active"] else "🔴"
            text2 += f"{s} *{t['title']}* — {t['points']} pts\n"
            kb2.append([InlineKeyboardButton(f"{'🔴 Désactiver' if t['active'] else '🟢 Activer'} : {t['title']}", callback_data=f"adm_toggle_{t['id']}")])
        kb2.append([InlineKeyboardButton("➕ Ajouter une tâche", callback_data="adm_add_task")])
        kb2.append([InlineKeyboardButton("⬅️ Retour", callback_data="adm_menu")])
        await query.edit_message_text(text2, parse_mode="Markdown", reply_markup=InlineKeyboardMarkup(kb2))

    elif data == "adm_add_task":
        if not is_admin(user.id): return
        context.user_data["admin_state"] = ADMIN_WAITING_TASK
        await query.edit_message_text(
            "➕ *Ajouter une tâche*\n\nFormat :\n`emoji | Titre | Description | Points | Lien`\n\n"
            "Exemple :\n`▶️ | Voir notre vidéo | Regarde la vidéo YT | 15 | https://youtube.com/...`",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("❌ Annuler", callback_data="adm_tasks")]]))

    elif data == "adm_points":
        if not is_admin(user.id): return
        context.user_data["admin_state"] = ADMIN_WAITING_POINTS
        await query.edit_message_text(
            "🎁 *Donner / Retirer des points*\n\nFormat :\n`telegram_id | points | raison`\n\n"
            "• Positif = donner  |  Négatif = retirer\n\n"
            "Exemples :\n`123456789 | 100 | Bonus`\n`123456789 | -50 | Sanction`",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("❌ Annuler", callback_data="adm_menu")]]))

async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user        = update.effective_user
    db_user     = get_user(user.id)
    admin_state = context.user_data.get("admin_state")
    user_state  = context.user_data.get("withdraw_state")
    text        = update.message.text.strip()

    if admin_state == ADMIN_WAITING_TASK and is_admin(user.id):
        try:
            parts = [p.strip() for p in text.split("|")]
            emoji, title, desc, pts, link = parts[0], parts[1], parts[2], int(parts[3]), parts[4]
            supabase.table("tasks").insert({"emoji": emoji,"title": title,"description": desc,"points": pts,"link": link,"active": True,"created_at": datetime.utcnow().isoformat()}).execute()
            context.user_data.pop("admin_state", None)
            await update.message.reply_text(f"✅ *Tâche ajoutée !*\n\n{emoji} *{title}* — {pts} pts",
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("✅ Voir tâches", callback_data="adm_tasks"), InlineKeyboardButton("🏠 Admin", callback_data="adm_menu")]]))
        except Exception:
            await update.message.reply_text("❌ Format incorrect.\nFormat : `emoji | Titre | Description | Points | Lien`", parse_mode="Markdown")

    elif admin_state == ADMIN_WAITING_POINTS and is_admin(user.id):
        try:
            parts  = [p.strip() for p in text.split("|")]
            tid    = int(parts[0])
            pts    = int(parts[1])
            reason = parts[2] if len(parts) > 2 else "Action admin"
            target = get_user(tid)
            if not target:
                await update.message.reply_text("❌ Utilisateur introuvable.")
                return
            if pts > 0:
                add_points(tid, pts, reason)
                action = f"*+{pts} pts* ajoutés"
            else:
                ok = deduct_points(tid, abs(pts), reason)
                action = f"*{pts} pts* retirés" if ok else "❌ Points insuffisants"
            context.user_data.pop("admin_state", None)
            await update.message.reply_text(f"✅ {action} à *{target['full_name']}*\n📋 _{reason}_",
                parse_mode="Markdown",
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("⬅️ Admin", callback_data="adm_menu")]]))
            try:
                await context.bot.send_message(chat_id=tid,
                    text=f"💎 *Mise à jour points !*\n\n{'➕' if pts > 0 else '➖'} *{abs(pts)} pts* — _{reason}_\n\n💰 Nouveau solde : *{get_user(tid)['points']} pts*",
                    parse_mode="Markdown")
            except Exception: pass
        except Exception:
            await update.message.reply_text("❌ Format : `telegram_id | points | raison`", parse_mode="Markdown")

    elif admin_state == ADMIN_WAITING_REJECT and is_admin(user.id):
        wid    = context.user_data.get("admin_reject_id")
        reason = text
        res    = supabase.table("withdrawals").select("*").eq("id", wid).execute()
        if res.data:
            w = res.data[0]
            supabase.table("withdrawals").update({"status": "rejected"}).eq("id", wid).execute()
            add_points(w["telegram_id"], w["points"], f"Remboursement retrait #{wid}")
            try:
                await context.bot.send_message(chat_id=w["telegram_id"],
                    text=f"❌ *Retrait rejeté*\n\nRetrait #{wid} de *{w['fcfa_equivalent']} FCFA* refusé.\n📋 Raison : _{reason}_\n\n💎 Tes *{w['points']} pts* ont été remboursés.\n📩 {SUPPORT_USERNAME}",
                    parse_mode="Markdown")
            except Exception: pass
        context.user_data.pop("admin_state", None)
        context.user_data.pop("admin_reject_id", None)
        await update.message.reply_text(f"✅ Retrait #{wid} rejeté et utilisateur remboursé.",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("💸 Retraits", callback_data="adm_withdrawals")]]))

    elif user_state == WAITING_WALLET and db_user:
        wallet = text
        crypto = context.user_data.get("withdraw_crypto", "USDT")
        pts    = db_user["points"]
        if pts < POINTS_MIN_RETRAIT:
            await update.message.reply_text("❌ Points insuffisants.")
            context.user_data.clear()
            return
        fcfa = p2f(pts)
        deduct_points(user.id, pts, f"Retrait {crypto} — {fcfa} FCFA")
        supabase.table("withdrawals").insert({"telegram_id": user.id,"points": pts,"fcfa_equivalent": fcfa,"crypto_type": crypto,"wallet_address": wallet,"status": "pending","created_at": datetime.utcnow().isoformat()}).execute()
        context.user_data.clear()
        for admin_id in ADMIN_IDS:
            try:
                await context.bot.send_message(chat_id=admin_id,
                    text=f"🔔 *Nouveau retrait !*\n\n👤 {user.full_name} (`{user.id}`)\n💎 {pts} pts = *{fcfa} FCFA*\n🔐 {crypto} : `{wallet}`",
                    parse_mode="Markdown",
                    reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("💸 Voir retraits", callback_data="adm_withdrawals")]]))
            except Exception: pass
        await update.message.reply_text(
            f"✅ *Demande envoyée !*\n\n💎 *{pts} pts = {fcfa} FCFA* en *{crypto}*\n📬 Wallet : `{wallet}`\n\n⏳ Traitement sous 24–48h\n📩 {SUPPORT_USERNAME}",
            parse_mode="Markdown", reply_markup=main_kb())

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("admin", admin_panel))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    logger.info("🚀 XAFEarnBot démarré !")
    app.run_polling()

if __name__ == "__main__":
    main()
