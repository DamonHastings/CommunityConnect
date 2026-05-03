class CreateSavedOrganizations < ActiveRecord::Migration[8.1]
  def change
    create_table :saved_organizations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: false, foreign_key: true
      t.timestamps
    end

    add_index :saved_organizations, [:user_id, :organization_id],
              unique: true,
              name: "index_saved_organizations_on_user_and_org"
  end
end
