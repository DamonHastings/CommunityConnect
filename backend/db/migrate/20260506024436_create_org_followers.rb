class CreateOrgFollowers < ActiveRecord::Migration[8.1]
  def change
    create_table :org_followers do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: false, foreign_key: true

      t.timestamps
    end

    add_index :org_followers, [:user_id, :organization_id], unique: true
  end
end
