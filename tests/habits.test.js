const test=require('node:test');
const assert=require('node:assert/strict');
const {dateKey,shiftDay,streak,toggleDay}=require('../src/habits');
test('local dates cross year boundaries',()=>{assert.equal(dateKey(shiftDay(new Date(2026,0,1,12),-1)),'2025-12-31');});
test('yesterday keeps a streak before today is done',()=>{assert.equal(streak({days:['2026-10-01','2026-10-02']},new Date(2026,9,3,12)),2);});
test('today extends a streak and a gap breaks it',()=>{assert.equal(streak({days:['2026-10-01','2026-10-02','2026-10-03']},new Date(2026,9,3,12)),3);assert.equal(streak({days:['2026-10-01']},new Date(2026,9,3,12)),0);});
test('toggle is reversible and immutable',()=>{const habit={id:'1',days:[]};const done=toggleDay(habit,'2026-10-03');assert.deepEqual(done.days,['2026-10-03']);assert.deepEqual(habit.days,[]);assert.deepEqual(toggleDay(done,'2026-10-03').days,[]);});
