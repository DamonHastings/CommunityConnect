class CreateOrganizations < ActiveRecord::Migration[8.1]
  def change
    create_table :organizations do |t|
      t.string :name
      t.text :description
      t.text :mission
      t.integer :category
      t.string :website
      t.string :contact_email
      t.string :phone
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.float :latitude
      t.float :longitude
      t.integer :status
      t.boolean :verified

      t.timestamps
    end
  end
end
