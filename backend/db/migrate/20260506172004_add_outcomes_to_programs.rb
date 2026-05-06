class AddOutcomesToPrograms < ActiveRecord::Migration[8.1]
  def change
    add_column :programs, :outcomes, :text
  end
end
