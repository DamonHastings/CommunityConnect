class AddProfileFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :profile_type, :integer, default: 0, null: false
    add_column :users, :bio, :text
    add_column :users, :phone, :string
    add_column :users, :city, :string
    add_column :users, :state, :string
    add_column :users, :website, :string
    add_column :users, :availability, :string
    add_column :users, :services_offered, :string, array: true, default: []
    add_column :users, :services_needed, :string, array: true, default: []
  end
end
