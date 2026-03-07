module Api
  module V1
    class TodoImagesController < ApplicationController
      before_action :set_todo

      def create
        @todo.image.attach(params.expect(:image))

        if @todo.valid?
          render json: @todo
        else
          @todo.image.purge
          render json: { errors: @todo.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        if @todo.image.attached?
          @todo.image.purge
          render json: @todo
        else
          head :not_found
        end
      end

      private

      def set_todo
        @todo = Current.user.todos.find(params.expect(:todo_id))
      end
    end
  end
end
