class CreateReferrals < ActiveRecord::Migration[8.1]
  def change
    create_table :referrals do |t|
      t.references :referring_org, null: false, foreign_key: { to_table: :organizations }
      t.references :referred_user, null: false, foreign_key: { to_table: :users }
      t.integer :status, null: false, default: 0
      t.string :target_type
      t.bigint :target_id
      t.text :message

      t.timestamps
    end

    add_index :referrals, [:referred_user_id, :status]
    add_index :referrals, [:target_type, :target_id]
  end
end
