class AddDueDateToTodos < ActiveRecord::Migration[8.1]
  def change
    add_column :todos, :due_date, :datetime, null: true
  end
end
