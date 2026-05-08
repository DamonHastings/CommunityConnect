class AddAdvocateAndCohorts < ActiveRecord::Migration[8.0]
  def up
    create_table :cohorts do |t|
      t.references :program, null: false, foreign_key: true
      t.string :name, null: false
      t.date :starts_on
      t.date :ends_on
      t.text :notes
      t.timestamps
    end

    create_table :cohort_memberships do |t|
      t.references :cohort, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :cohort_memberships, [:cohort_id, :user_id], unique: true

    create_table :program_milestones do |t|
      t.references :program, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.date :due_date
      t.integer :position, default: 0, null: false
      t.timestamps
    end
    add_index :program_milestones, [:program_id, :position]

    create_table :milestone_completions do |t|
      t.references :milestone, null: false, foreign_key: { to_table: :program_milestones }
      t.references :user, null: false, foreign_key: true
      t.datetime :completed_at
      t.text :notes
      t.timestamps
    end
    add_index :milestone_completions, [:milestone_id, :user_id], unique: true

    create_table :user_tasks do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :notes
      t.date :due_date
      t.boolean :completed, default: false, null: false
      t.datetime :completed_at
      t.string :source_type
      t.integer :source_id
      t.timestamps
    end
    add_index :user_tasks, [:source_type, :source_id]

    create_table :client_profiles do |t|
      t.references :advocate, null: false, foreign_key: { to_table: :users }
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email
      t.string :phone
      t.string :city
      t.string :state
      t.integer :housing_status
      t.integer :employment_status
      t.string :needs_categories, array: true, default: []
      t.integer :urgency
      t.text :goals
      t.text :barriers
      t.text :notes
      t.timestamps
    end

    create_table :client_applications do |t|
      t.references :client_profile, null: false, foreign_key: true
      t.references :program, null: false, foreign_key: true
      t.integer :status, default: 0, null: false
      t.text :message
      t.text :notes
      t.timestamps
    end
  end

  def down
    drop_table :client_applications
    drop_table :client_profiles
    drop_table :user_tasks
    drop_table :milestone_completions
    drop_table :program_milestones
    drop_table :cohort_memberships
    drop_table :cohorts
  end
end
