import React from "react";
import Todo from "./todo";
function Todos() {
  return (
    <div className="flex justify-center items-center flex-col m-4">
      <p className=""> <pre></pre> sitenin kayda değer hiçbir güvenliği bulunmamakla birlikte hiçbir sorumlulukta kabul etmiyorum şuan sadece aşağıdakileri vakit buldukça sırayla yapıcam sorun yaşarsanız yazmayın </p>
      {Todo.map((todo) => (
        <>
          <div className="w-2/3 drop-shadow-lg m-4 border-2 rounded-md min-h-[5vh] p-4 flex flex-row hover:backdrop-blur-2xl z-20">
            <div className="id m-2">{todo.id}-</div>
            <div className="todo m-2">{todo.todo}</div>
          </div>
        </>
      ))}
    </div>
  );
}

export default Todos;
