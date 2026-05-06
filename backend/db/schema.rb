# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_06_175308) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "announcements", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.bigint "organization_id", null: false
    t.datetime "published_at"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id", "published_at"], name: "index_announcements_on_organization_id_and_published_at"
    t.index ["organization_id"], name: "index_announcements_on_organization_id"
  end

  create_table "caseloads", force: :cascade do |t|
    t.bigint "client_id", null: false
    t.datetime "created_at", null: false
    t.bigint "navigator_id", null: false
    t.text "notes"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_caseloads_on_client_id"
    t.index ["navigator_id", "client_id"], name: "index_caseloads_on_navigator_id_and_client_id", unique: true
    t.index ["navigator_id"], name: "index_caseloads_on_navigator_id"
  end

  create_table "conversation_participants", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "last_read_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["conversation_id", "user_id"], name: "index_conversation_participants_on_conversation_id_and_user_id", unique: true
    t.index ["conversation_id"], name: "index_conversation_participants_on_conversation_id"
    t.index ["user_id"], name: "index_conversation_participants_on_user_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "engagement_opportunities", force: :cascade do |t|
    t.string "contact_email"
    t.datetime "created_at", null: false
    t.text "description"
    t.text "eligibility"
    t.date "end_date"
    t.decimal "funding_amount", precision: 12, scale: 2
    t.integer "opportunity_type"
    t.bigint "organization_id", null: false
    t.boolean "remote"
    t.text "requirements"
    t.date "start_date"
    t.integer "status"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_engagement_opportunities_on_organization_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body", null: false
    t.bigint "conversation_id", null: false
    t.datetime "created_at", null: false
    t.bigint "sender_id", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "actor_name"
    t.text "body"
    t.datetime "created_at", null: false
    t.bigint "notifiable_id"
    t.string "notifiable_type"
    t.integer "notification_type", null: false
    t.datetime "read_at"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.bigint "user_id", null: false
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable_type_and_notifiable_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "org_followers", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "organization_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["organization_id"], name: "index_org_followers_on_organization_id"
    t.index ["user_id", "organization_id"], name: "index_org_followers_on_user_id_and_organization_id", unique: true
    t.index ["user_id"], name: "index_org_followers_on_user_id"
  end

  create_table "organization_memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "invited_by_id"
    t.datetime "joined_at"
    t.bigint "organization_id", null: false
    t.integer "role"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["organization_id"], name: "index_organization_memberships_on_organization_id"
    t.index ["user_id"], name: "index_organization_memberships_on_user_id"
  end

  create_table "organizations", force: :cascade do |t|
    t.string "address"
    t.integer "category"
    t.string "city"
    t.string "contact_email"
    t.string "country"
    t.datetime "created_at", null: false
    t.integer "creator_id"
    t.text "description"
    t.boolean "featured", default: false, null: false
    t.date "featured_until"
    t.float "latitude"
    t.float "longitude"
    t.text "mission"
    t.string "name"
    t.integer "org_type", default: 0, null: false
    t.string "phone"
    t.string "state"
    t.integer "status"
    t.datetime "updated_at", null: false
    t.boolean "verified"
    t.string "website"
    t.string "zip"
    t.index ["featured"], name: "index_organizations_on_featured"
    t.index ["org_type"], name: "index_organizations_on_org_type"
  end

  create_table "partner_connections", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message"
    t.bigint "requester_org_id", null: false
    t.integer "status", default: 0, null: false
    t.bigint "target_org_id", null: false
    t.datetime "updated_at", null: false
    t.index ["requester_org_id", "target_org_id"], name: "idx_on_requester_org_id_target_org_id_90f2d59357", unique: true
    t.index ["requester_org_id"], name: "index_partner_connections_on_requester_org_id"
    t.index ["target_org_id"], name: "index_partner_connections_on_target_org_id"
  end

  create_table "program_applications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message"
    t.text "notes"
    t.bigint "program_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["program_id"], name: "index_program_applications_on_program_id"
    t.index ["user_id", "program_id"], name: "index_program_applications_on_user_id_and_program_id", unique: true
    t.index ["user_id"], name: "index_program_applications_on_user_id"
  end

  create_table "program_organizations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "organization_id", null: false
    t.bigint "program_id", null: false
    t.integer "role", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_program_organizations_on_organization_id"
    t.index ["program_id", "organization_id"], name: "index_program_organizations_on_program_id_and_organization_id", unique: true
    t.index ["program_id"], name: "index_program_organizations_on_program_id"
  end

  create_table "programs", force: :cascade do |t|
    t.datetime "application_closes_at"
    t.datetime "application_opens_at"
    t.integer "capacity"
    t.string "city"
    t.string "contact_email"
    t.datetime "created_at", null: false
    t.text "description"
    t.date "ends_on"
    t.text "goals"
    t.bigint "organization_id", null: false
    t.text "outcomes"
    t.integer "program_type", default: 0, null: false
    t.boolean "remote", default: false, null: false
    t.date "starts_on"
    t.string "state"
    t.integer "status", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["organization_id"], name: "index_programs_on_organization_id"
    t.index ["status"], name: "index_programs_on_status"
  end

  create_table "referrals", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message"
    t.bigint "referred_user_id", null: false
    t.bigint "referring_org_id", null: false
    t.integer "status", default: 0, null: false
    t.bigint "target_id"
    t.string "target_type"
    t.datetime "updated_at", null: false
    t.index ["referred_user_id", "status"], name: "index_referrals_on_referred_user_id_and_status"
    t.index ["referred_user_id"], name: "index_referrals_on_referred_user_id"
    t.index ["referring_org_id"], name: "index_referrals_on_referring_org_id"
    t.index ["target_type", "target_id"], name: "index_referrals_on_target_type_and_target_id"
  end

  create_table "saved_organizations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "organization_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["organization_id"], name: "index_saved_organizations_on_organization_id"
    t.index ["user_id", "organization_id"], name: "index_saved_organizations_on_user_and_org", unique: true
    t.index ["user_id"], name: "index_saved_organizations_on_user_id"
  end

  create_table "service_applications", force: :cascade do |t|
    t.bigint "applicant_org_id"
    t.decimal "award_amount", precision: 12, scale: 2
    t.datetime "created_at", null: false
    t.boolean "disbursed", default: false, null: false
    t.bigint "engagement_opportunity_id", null: false
    t.text "message"
    t.text "notes"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["applicant_org_id"], name: "index_service_applications_on_applicant_org_id"
    t.index ["engagement_opportunity_id"], name: "index_service_applications_on_engagement_opportunity_id"
    t.index ["user_id", "engagement_opportunity_id"], name: "index_service_applications_on_user_and_opportunity", unique: true
    t.index ["user_id"], name: "index_service_applications_on_user_id"
  end

  create_table "user_intake_responses", force: :cascade do |t|
    t.text "barriers"
    t.datetime "created_at", null: false
    t.integer "employment_status", default: 0, null: false
    t.text "goals"
    t.integer "housing_status", default: 0, null: false
    t.string "needs_categories", default: [], array: true
    t.string "preferred_contact"
    t.datetime "updated_at", null: false
    t.integer "urgency", default: 0, null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_user_intake_responses_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "availability"
    t.text "bio"
    t.string "city"
    t.text "communities_served", default: [], array: true
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name"
    t.string "jti", default: "", null: false
    t.string "last_name"
    t.string "phone"
    t.boolean "platform_admin"
    t.integer "profile_type", default: 0, null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "services_needed", default: [], array: true
    t.string "services_offered", default: [], array: true
    t.string "specialty"
    t.string "state"
    t.datetime "updated_at", null: false
    t.string "website"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["profile_type"], name: "index_users_on_profile_type"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["specialty"], name: "index_users_on_specialty"
  end

  create_table "volunteer_hours", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.decimal "hours", precision: 5, scale: 2, null: false
    t.text "notes"
    t.bigint "service_application_id", null: false
    t.datetime "updated_at", null: false
    t.index ["service_application_id"], name: "index_volunteer_hours_on_service_application_id"
  end

  add_foreign_key "announcements", "organizations"
  add_foreign_key "caseloads", "users", column: "client_id"
  add_foreign_key "caseloads", "users", column: "navigator_id"
  add_foreign_key "conversation_participants", "conversations"
  add_foreign_key "conversation_participants", "users"
  add_foreign_key "engagement_opportunities", "organizations"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "notifications", "users"
  add_foreign_key "org_followers", "organizations"
  add_foreign_key "org_followers", "users"
  add_foreign_key "organization_memberships", "organizations"
  add_foreign_key "organization_memberships", "users"
  add_foreign_key "partner_connections", "organizations", column: "requester_org_id"
  add_foreign_key "partner_connections", "organizations", column: "target_org_id"
  add_foreign_key "program_applications", "programs"
  add_foreign_key "program_applications", "users"
  add_foreign_key "program_organizations", "organizations"
  add_foreign_key "program_organizations", "programs"
  add_foreign_key "programs", "organizations"
  add_foreign_key "referrals", "organizations", column: "referring_org_id"
  add_foreign_key "referrals", "users", column: "referred_user_id"
  add_foreign_key "saved_organizations", "organizations"
  add_foreign_key "saved_organizations", "users"
  add_foreign_key "service_applications", "engagement_opportunities"
  add_foreign_key "service_applications", "organizations", column: "applicant_org_id"
  add_foreign_key "service_applications", "users"
  add_foreign_key "user_intake_responses", "users"
  add_foreign_key "volunteer_hours", "service_applications"
end
