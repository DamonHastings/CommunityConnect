class AddOrgTypeToOrganizations < ActiveRecord::Migration[8.1]
  def change
    add_column :organizations, :org_type, :integer, default: 0, null: false
    add_index :organizations, :org_type
  end
end
