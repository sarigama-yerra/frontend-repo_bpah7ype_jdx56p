import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Salad, CupSoda, Egg, Sandwich, Filter, Leaf, FlameKindling, Milk, Settings2, Check, Plus, Minus, ShoppingCart, Repeat } from 'lucide-react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const categories = [
  { key: 'Breakfasts', icon: Egg, label: 'Breakfasts' },
  { key: 'Main Meals', icon: Sandwich, label: 'Main Meals' },
  { key: 'Smoothies & Shakes', icon: CupSoda, label: 'Smoothies & Shakes' },
]

const dietOptions = [
  { key: '', label: 'All' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'keto', label: 'Keto' },
  { key: 'low-carb', label: 'Low-carb' },
  { key: 'vegetarian', label: 'Vegetarian' },
]

function MacroPill({ label, value, color }) {
  return (
    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${color} bg-opacity-10`}
         style={{ backgroundColor: undefined }}>
      <span className="opacity-80">{label}</span> <span className="ml-1">{value}</span>
    </div>
  )
}

function MacroBar({ protein, carbs, fats }) {
  const total = Math.max(1, protein + carbs + fats)
  const p = Math.round((protein / total) * 100)
  const c = Math.round((carbs / total) * 100)
  const f = Math.round((fats / total) * 100)
  return (
    <div className="w-full h-2 bg-gray-100 rounded overflow-hidden flex">
      <div className="h-full bg-green-500" style={{ width: `${p}%` }} />
      <div className="h-full bg-blue-500" style={{ width: `${c}%` }} />
      <div className="h-full bg-amber-500" style={{ width: `${f}%` }} />
    </div>
  )
}

function MealCard({ meal, onAddToPlan }) {
  const [servings, setServings] = useState(1)
  const scaled = useMemo(() => {
    const factor = Math.max(0.25, servings)
    const m = meal.macros || { protein: 0, carbs: 0, fats: 0, calories: 0 }
    return {
      protein: +(m.protein * factor).toFixed(1),
      carbs: +(m.carbs * factor).toFixed(1),
      fats: +(m.fats * factor).toFixed(1),
      calories: +(m.calories * factor).toFixed(0),
    }
  }, [servings, meal])

  const [addon, setAddon] = useState('')

  return (
    <motion.div layout className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 flex flex-col">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          <Dumbbell className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{meal.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{meal.description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">${meal.price.toFixed(2)}</div>
          <div className="text-xs text-gray-400">per serving</div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <MacroBar protein={meal.macros.protein} carbs={meal.macros.carbs} fats={meal.macros.fats} />
        <div className="flex items-center gap-2 flex-wrap">
          <MacroPill label="P" value={`${scaled.protein}g`} color="text-green-700" />
          <MacroPill label="C" value={`${scaled.carbs}g`} color="text-blue-700" />
          <MacroPill label="F" value={`${scaled.fats}g`} color="text-amber-700" />
          <MacroPill label="Kcals" value={`${scaled.calories}`} color="text-gray-700" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setServings(s => Math.max(0.25, +(s - 0.25).toFixed(2)))} className="p-2 rounded-md border hover:bg-gray-50">
            <Minus size={16} />
          </button>
          <div className="text-sm font-medium w-16 text-center">{servings}x</div>
          <button onClick={() => setServings(s => +(s + 0.25).toFixed(2))} className="p-2 rounded-md border hover:bg-gray-50">
            <Plus size={16} />
          </button>
        </div>
        {meal.is_customizable && (
          <select value={addon} onChange={(e) => setAddon(e.target.value)} className="text-sm border rounded-md px-2 py-1">
            <option value="">Add-on</option>
            {meal.available_add_ons?.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}
        <button onClick={() => onAddToPlan(meal, servings)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 rounded-md">
          <ShoppingCart size={16} /> Add
        </button>
      </div>

      {meal.diet_tags?.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {meal.diet_tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function SubscriptionPanel({ plan, onChange, onSubmit }) {
  const totalProtein = plan.items.reduce((sum, it) => sum + (it.macros?.protein || 0), 0)
  const totalCalories = plan.items.reduce((sum, it) => sum + (it.macros?.calories || 0), 0)
  const totalPrice = plan.items.reduce((sum, it) => sum + (it.price || 0), 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Repeat className="text-emerald-600" /> Meal Subscription</h3>
          <p className="text-sm text-gray-500">Recurring plan tailored to your protein target</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input className="w-full border rounded-md px-3 py-2" type="email" value={plan.email} onChange={(e)=>onChange({ email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Frequency</label>
          <select className="w-full border rounded-md px-3 py-2" value={plan.frequency} onChange={(e)=>onChange({ frequency: e.target.value })}>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Daily Protein Target (g)</label>
          <input className="w-full border rounded-md px-3 py-2" type="number" min={20} max={400} value={plan.target} onChange={(e)=>onChange({ target: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-4 space-y-2 max-h-48 overflow-auto pr-1">
        {plan.items.length === 0 ? (
          <p className="text-sm text-gray-500">No items added yet.</p>
        ) : (
          plan.items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between border rounded-md p-2">
              <div>
                <div className="font-medium text-gray-800">{it.title} <span className="text-xs text-gray-400">x{it.servings}</span></div>
                <div className="text-xs text-gray-500">P {it.macros.protein}g • {it.macros.calories} kcal</div>
              </div>
              <div className="text-sm font-semibold">${it.price.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500">Daily Protein</div>
          <div className="font-semibold">{totalProtein.toFixed(0)} g</div>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500">Calories</div>
          <div className="font-semibold">{totalCalories.toFixed(0)}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-gray-500">Est. Price / delivery</div>
          <div className="font-semibold">${totalPrice.toFixed(2)}</div>
        </div>
      </div>

      <button onClick={onSubmit} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md py-2">Start Subscription</button>
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('')
  const [diet, setDiet] = useState('')
  const [proteinMin, setProteinMin] = useState(25)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const [plan, setPlan] = useState({ email: '', frequency: 'weekly', target: 140, items: [] })
  const [toast, setToast] = useState('')

  useEffect(() => {
    // Try to seed once
    fetch(`${BACKEND}/seed`, { method: 'POST' }).catch(()=>{})
    setSeeded(true)
  }, [])

  const loadMeals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory) params.set('category', activeCategory)
      if (diet) params.set('diet', diet)
      if (proteinMin) params.set('min_protein', String(proteinMin))
      const res = await fetch(`${BACKEND}/meals?${params.toString()}`)
      const data = await res.json()
      setMeals(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMeals() }, [activeCategory, diet, proteinMin])

  const addToPlan = (meal, servings) => {
    const factor = Math.max(0.25, servings)
    const m = meal.macros
    const scaled = {
      protein: +(m.protein * factor).toFixed(1),
      carbs: +(m.carbs * factor).toFixed(1),
      fats: +(m.fats * factor).toFixed(1),
      calories: +(m.calories * factor).toFixed(0),
    }
    setPlan(p => ({
      ...p,
      items: [
        ...p.items,
        { id: meal.id, title: meal.title, servings: factor, price: meal.price * factor, macros: scaled }
      ]
    }))
    setToast(`${meal.title} added to plan`)
    setTimeout(()=>setToast(''), 1800)
  }

  const submitSubscription = async () => {
    if (!plan.email) { setToast('Please enter your email'); setTimeout(()=>setToast(''), 1500); return }
    try {
      const payload = {
        email: plan.email,
        frequency: plan.frequency,
        target_protein_g_per_day: plan.target,
        items: plan.items.map(it => ({ meal_id: it.id, servings: it.servings }))
      }
      const res = await fetch(`${BACKEND}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed')
      setToast('Subscription created!')
      setPlan(p => ({ ...p, items: [] }))
    } catch (e) {
      setToast('Error creating subscription')
    } finally {
      setTimeout(()=>setToast(''), 1800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Dumbbell className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-gray-900 tracking-tight">ProteinFuel</div>
              <div className="text-xs text-gray-500 -mt-1">Hit your daily protein target</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-2"><FlameKindling size={16}/> High-protein only</div>
            <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">Macros-first</div>
            <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">Subscriptions</div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-800 flex items-center gap-2"><Filter size={18}/> Filters</div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500">Category</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {categories.map(c => (
                    <button key={c.key} onClick={()=>setActiveCategory(v => v === c.key ? '' : c.key)} className={`px-2 py-1.5 rounded-md border text-sm ${activeCategory===c.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-gray-50'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Diet</label>
                <select value={diet} onChange={(e)=>setDiet(e.target.value)} className="w-full border rounded-md px-2 py-2 mt-1 text-sm">
                  {dietOptions.map(d => (<option key={d.key} value={d.key}>{d.label}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Min Protein (g/serving)</label>
                <input type="range" min={0} max={100} value={proteinMin} onChange={(e)=>setProteinMin(Number(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-600 mt-1">{proteinMin}g</div>
              </div>
            </div>
          </div>

          <SubscriptionPanel
            plan={plan}
            onChange={(patch)=>setPlan(p=>({ ...p, ...('target' in patch ? { target: patch.target } : {}), ...patch }))}
            onSubmit={submitSubscription}
          />
        </div>
      </section>

      {/* Meals */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">Meals</h2>
          <div className="text-sm text-gray-500">{meals.length} results</div>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading meals...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {meals.map(m => (
                <MealCard key={m.id || m._id} meal={m} onAddToPlan={addToPlan} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
