class AddFeaturedToOrganizations < ActiveRecord::Migration[8.1]
  def change
    add_column :organizations, :featured, :boolean, default: false, null: false
    add_column :organizations, :featured_until, :date
    add_index :organizations, :featured
  end
end
