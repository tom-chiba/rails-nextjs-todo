class AddUserToTodos < ActiveRecord::Migration[8.1]
  def change
    Todo.delete_all
    add_reference :todos, :user, null: false, foreign_key: true
  end
end
