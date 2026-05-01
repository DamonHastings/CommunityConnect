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

ActiveRecord::Schema[8.1].define(version: 2026_05_01_205720) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "engagement_opportunities", force: :cascade do |t|
    t.string "contact_email"
    t.datetime "created_at", null: false
    t.text "description"
    t.date "end_date"
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
    t.float "latitude"
    t.float "longitude"
    t.text "mission"
    t.string "name"
    t.string "phone"
    t.string "state"
    t.integer "status"
    t.datetime "updated_at", null: false
    t.boolean "verified"
    t.string "website"
    t.string "zip"
  end

  create_table "users", force: :cascade do |t|
    t.string "availability"
    t.text "bio"
    t.string "city"
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
    t.string "state"
    t.datetime "updated_at", null: false
    t.string "website"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "engagement_opportunities", "organizations"
  add_foreign_key "organization_memberships", "organizations"
  add_foreign_key "organization_memberships", "users"
end
