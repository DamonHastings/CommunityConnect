class AddProfessionalFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :specialty, :string
    add_column :users, :communities_served, :text, array: true, default: []
    add_index :users, :specialty
    add_index :users, :profile_type
  end
end
