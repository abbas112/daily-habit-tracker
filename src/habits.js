function dateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}
function shiftDay(date, amount) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  copy.setDate(copy.getDate()+amount);
  return copy;
}
function streak(habit, today = new Date()) {
  let day = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  if (!habit.days.includes(dateKey(day))) day = shiftDay(day,-1);
  let count=0;
  while(habit.days.includes(dateKey(day))) { count++; day=shiftDay(day,-1); }
  return count;
}
function toggleDay(habit,key) {
  return {...habit,days:habit.days.includes(key) ? habit.days.filter(d=>d!==key) : [...habit.days,key]};
}
module.exports = {dateKey,shiftDay,streak,toggleDay};
