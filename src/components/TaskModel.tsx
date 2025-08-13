import { useEffect, useState } from "react";
import formbg from '../assets/formbackground.png'

type Category = "To Do" | "In Progress" | "Review" | "Completed";

interface TaskLocal {
  id: string;
  name: string;
  category: Category;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // inclusive
  row?: number; // computed layout row
}

export default function TaskModal({ open, onClose, initialStart, initialEnd, onCreate }: { open: boolean; onClose: () => void; initialStart: string; initialEnd: string; onCreate: (name: string, category: Category) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("To Do");

  useEffect(() => { if (open) { setName(""); setCategory("To Do"); } }, [open]);

  if (!open) return null;
  return (<>

    <div className="w-full h-[250px] flex justify-center items-center">
      <div
        className="relative h-screen w-[500px] flex flex-col p-4"
        style={{
          backgroundImage: `url(${formbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Form */}
        <form className="absolute inset-0  flex flex-col justify-center items-center p-5 space-y-10">
          <h2 className='text-white font-bold text-5xl -translate-y-7'>  Create Your Tasks</h2>

          <label className=" font-medium text-white flex flex-col space-y-2 w-full">
            <div className="text-xl text-white font-bold mb-2">{initialStart} → {initialEnd}</div>


            <input
              className="px-3 py-2 text-lg rounded w-full bg-[#9A6B6B] text-white placeholder-gray-200 focus:outline-none"
              placeholder="Task name" value={name} onChange={e => setName(e.target.value)} />
            <select
              className="px-3 py-2 text-lg rounded w-full bg-[#9A6B6B] text-white placeholder-gray-200 focus:outline-none"
              value={category} onChange={e => setCategory(e.target.value as Category)}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Completed</option>
            </select>
          </label>



          <div className="flex gap-3 justify-around">
            <button type="submit" onClick={onClose} className="bg-white px-20 py-2 rounded text-orange-800 text-lg font-bold hover:bg-orange-100 transition">
              Close
            </button>
            <button type="submit" onClick={() => { if (name.trim()) onCreate(name.trim(), category); }} className="bg-white px-20 py-2 rounded text-orange-800 text-lg font-bold hover:bg-orange-100 transition">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>


  </>
  );
}
