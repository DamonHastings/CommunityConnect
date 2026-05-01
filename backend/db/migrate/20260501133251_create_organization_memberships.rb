class CreateOrganizationMemberships < ActiveRecord::Migration[8.1]
  def change
    create_table :organization_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: false, foreign_key: true
      t.integer :role
      t.integer :invited_by_id
      t.datetime :joined_at

      t.timestamps
    end
  end
end
