class CreateCaseloads < ActiveRecord::Migration[8.1]
  def change
    create_table :caseloads do |t|
      t.bigint :navigator_id, null: false
      t.bigint :client_id, null: false
      t.text :notes
      t.integer :status, default: 0, null: false

      t.timestamps
    end

    add_foreign_key :caseloads, :users, column: :navigator_id
    add_foreign_key :caseloads, :users, column: :client_id
    add_index :caseloads, [:navigator_id, :client_id], unique: true
    add_index :caseloads, :navigator_id
    add_index :caseloads, :client_id
  end
end
