class AddCreatorIdToOrganizations < ActiveRecord::Migration[8.1]
  def change
    add_column :organizations, :creator_id, :integer
  end
end
