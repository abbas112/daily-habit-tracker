import React, { useEffect, useRef, useState } from 'react';
import { AppState, Alert, ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dateKey, streak, toggleDay } from './src/habits';

const KEY = 'daily-habits-v1';
const colors = ['#54795D','#8471AB','#B8754D','#487C99'];
export default function App() {
  const [habits,setHabits] = useState([]);
  const [ready,setReady] = useState(false);
  const [error,setError] = useState('');
  const [tab,setTab] = useState('today');
  const [today,setToday] = useState(dateKey());
  const [month,setMonth] = useState(new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const [editor,setEditor] = useState(null);
  const [name,setName] = useState('');
  const [tone,setTone] = useState(colors[0]);
  const queue = useRef(Promise.resolve());
  useEffect(()=>{
    AsyncStorage.getItem(KEY).then(raw=>{
      if(raw) {
        const value=JSON.parse(raw);
        if(!Array.isArray(value) || !value.every(h=>typeof h.id==='string' && typeof h.name==='string' && typeof h.color==='string' && Array.isArray(h.days) && h.days.every(d=>typeof d==='string'))) throw new Error('Invalid saved data');
        setHabits(value);
      }
      setReady(true);
    }).catch(()=>setError('Could not load saved habits. Close and reopen the app to try again.'));
    const refresh=()=>setToday(dateKey());
    const timer=setInterval(refresh,30000);
    const sub=AppState.addEventListener('change',state=>{if(state==='active')refresh();});
    return ()=>{clearInterval(timer);sub.remove();};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const snapshot=JSON.stringify(habits);
    queue.current=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(KEY,snapshot)).then(()=>setError('')).catch(()=>setError('Could not save your changes. Keep the app open and make another change to retry.'));
  },[habits,ready]);
  const active=habits.filter(h=>!h.archived);
  const done=active.filter(h=>h.days.includes(today)).length;
  const open=(habit=null)=>{setEditor(habit || {id:null});setName(habit?.name || '');setTone(habit?.color || colors[0]);};
  const save=()=>{
    const title=name.trim();
    if(!title)return;
    if(editor.id)setHabits(list=>list.map(h=>h.id===editor.id?{...h,name:title,color:tone}:h));
    else setHabits(list=>[...list,{id:Date.now().toString(36)+Math.random().toString(36).slice(2),name:title,color:tone,days:[],created:today,archived:false}]);
    setEditor(null);
  };
  const archive=h=>Alert.alert('Archive habit?', 'Its history will stay in your calendar.', [{text:'Cancel',style:'cancel'},{text:'Archive',onPress:()=>{setHabits(list=>list.map(item=>item.id===h.id?{...item,archived:true}:item));setEditor(null);}}]);
  if(!ready)return <SafeAreaView style={s.page}><View style={s.loading}>{error?<Text accessibilityRole="alert">{error}</Text>:<ActivityIndicator color="#54795D"/>}</View></SafeAreaView>;
  const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const offset=(month.getDay()+6)%7;
  return <SafeAreaView style={s.page}>
    <StatusBar barStyle="dark-content"/>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.eyebrow}>SMALL STEPS, EVERY DAY</Text>
      <Text style={s.title}>Daily habits</Text>
      <Text style={s.subtitle}>{new Date(today+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</Text>
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <View style={s.tabs}>{['today','progress'].map(item=><Pressable key={item} accessibilityRole="tab" accessibilityState={{selected:tab===item}} onPress={()=>setTab(item)} style={[s.tab,tab===item&&s.selectedTab]}><Text style={[s.tabText,tab===item&&s.selectedText]}>{item==='today'?'Today':'Progress'}</Text></Pressable>)}</View>
      {tab==='today'?<>
        <View style={s.summary}><Text style={s.summaryTitle}>{active.length && done===active.length?'All done. Well done!':'Make a little progress.'}</Text><Text style={s.summaryText}>{done} of {active.length} habits completed</Text><View style={s.track}><View style={[s.fill,{width:(active.length?done/active.length*100:0)+'%'}]}/></View></View>
        <View style={s.row}><Text style={s.section}>Your daily habits</Text><Pressable accessibilityRole="button" onPress={()=>open()} style={s.add}><Text style={s.addText}>+ Add habit</Text></Pressable></View>
        {!active.length&&<View style={s.empty}><Text style={s.emptyTitle}>One small habit is a start.</Text><Text style={s.subtitle}>Try drinking water, walking, or reading a page.</Text><Pressable style={s.primary} onPress={()=>open()}><Text style={s.primaryText}>Create your first habit</Text></Pressable></View>}
        {active.map(h=><View key={h.id} style={s.card}>
          <Pressable accessibilityRole="checkbox" accessibilityLabel={h.name} accessibilityState={{checked:h.days.includes(today)}} onPress={()=>setHabits(list=>list.map(item=>item.id===h.id?toggleDay(item,today):item))} style={[s.check,{borderColor:h.color},h.days.includes(today)&&{backgroundColor:h.color}]}><Text style={s.checkmark}>{h.days.includes(today)?'✓':''}</Text></Pressable>
          <View style={s.habitBody}><Text style={s.habitName}>{h.name}</Text><Text style={s.subtitle}>{streak(h,new Date(today+'T12:00:00'))} day streak</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={'Edit '+h.name} onPress={()=>open(h)} style={s.edit}><Text style={s.editText}>Edit</Text></Pressable>
        </View>)}
      </>:<>
        <View style={s.row}><Pressable accessibilityLabel="Previous month" onPress={()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))} style={s.monthButton}><Text>‹</Text></Pressable><Text style={s.section}>{month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</Text><Pressable accessibilityLabel="Next month" onPress={()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))} style={s.monthButton}><Text>›</Text></Pressable></View>
        <View style={s.calendar}>{['M','T','W','T','F','S','S'].map((label,i)=><View key={'w'+i} style={s.day}><Text style={s.weekday}>{label}</Text></View>)}{Array.from({length:offset},(_,i)=><View key={'blank'+i} style={s.day}/>)}{Array.from({length:days},(_,i)=>{
          const key=dateKey(new Date(month.getFullYear(),month.getMonth(),i+1));
          const completions=habits.filter(h=>h.days.includes(key)).length;
          return <View key={key} accessibilityLabel={key+', '+completions+' habits completed'} style={s.day}><View style={[s.date,completions>0&&s.completedDate,key===today&&s.todayDate]}><Text style={completions>0?s.lightText:s.dateText}>{i+1}</Text>{completions>0&&<Text style={s.dot}>{completions}</Text>}</View></View>;
        })}</View>
        <Text style={s.subtitle}>Green days show completed habits. The small number is your total that day.</Text>
        <Text style={[s.section,{marginTop:28}]}>Habit history</Text>
        {!habits.length&&<Text style={s.subtitle}>Add your first habit to begin your history.</Text>}
        {habits.map(h=><View style={s.card} key={h.id}><View style={s.habitBody}><Text style={s.habitName}>{h.name}{h.archived?' · Archived':''}</Text><Text style={s.subtitle}>{h.days.length} completed days{h.archived?'':' · '+streak(h,new Date(today+'T12:00:00'))+' day streak'}</Text></View>{h.archived&&<Pressable style={s.edit} accessibilityLabel={'Restore '+h.name} onPress={()=>setHabits(list=>list.map(item=>item.id===h.id?{...item,archived:false}:item))}><Text style={s.editText}>Restore</Text></Pressable>}</View>)}
      </>}
      <Text style={s.footer}>Consistency starts with today.</Text>
    </ScrollView>
    <Modal visible={!!editor} animationType="slide" onRequestClose={()=>setEditor(null)}>
      <SafeAreaView style={s.page}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><View style={s.row}><Text style={s.section}>{editor?.id?'Edit habit':'New daily habit'}</Text><Pressable onPress={()=>setEditor(null)} style={s.edit}><Text style={s.editText}>Cancel</Text></Pressable></View><Text style={s.title}>Keep it simple.</Text><Text style={s.subtitle}>Choose something you can do every day.</Text><Text style={s.label}>Habit name</Text><TextInput accessibilityLabel="Habit name" placeholder="e.g. Walk for 10 minutes" value={name} onChangeText={setName} maxLength={60} style={s.input} autoFocus returnKeyType="done" onSubmitEditing={save}/><Text style={s.label}>Color</Text><View style={s.swatches}>{colors.map((color,i)=><Pressable key={color} accessibilityLabel={'Color '+(i+1)} accessibilityRole="radio" accessibilityState={{selected:tone===color}} onPress={()=>setTone(color)} style={[s.swatch,{backgroundColor:color},tone===color&&s.swatchSelected]}><Text style={s.checkmark}>{tone===color?'✓':''}</Text></Pressable>)}</View><Pressable accessibilityRole="button" accessibilityState={{disabled:!name.trim()}} disabled={!name.trim()} style={[s.primary,!name.trim()&&{opacity:0.4}]} onPress={save}><Text style={s.primaryText}>Save habit</Text></Pressable>{editor?.id&&<Pressable style={s.archive} onPress={()=>archive(editor)}><Text style={s.archiveText}>Archive habit</Text></Pressable>}</ScrollView></KeyboardAvoidingView></SafeAreaView>
    </Modal>
  </SafeAreaView>;
}
const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#F7F6F2'},content:{padding:24,paddingBottom:40,maxWidth:640,width:'100%',alignSelf:'center'},loading:{flex:1,justifyContent:'center',alignItems:'center',padding:24},
  eyebrow:{fontSize:11,fontWeight:'700',letterSpacing:2,color:'#54795D',marginTop:18},title:{fontSize:36,fontWeight:'700',color:'#24372B',marginTop:12,marginBottom:8},subtitle:{fontSize:14,color:'#66736A',lineHeight:21},
  tabs:{flexDirection:'row',backgroundColor:'#EAEDE6',padding:4,borderRadius:16,marginVertical:24},tab:{flex:1,alignItems:'center',padding:13,borderRadius:12},selectedTab:{backgroundColor:'#FFFFFF'},tabText:{fontSize:15,fontWeight:'600',color:'#66736A'},selectedText:{color:'#24372B'},
  summary:{backgroundColor:'#E4EDDF',padding:22,borderRadius:22,marginBottom:24},summaryTitle:{fontSize:22,fontWeight:'600',color:'#24372B'},summaryText:{color:'#54795D',marginTop:8,fontSize:14},track:{height:7,backgroundColor:'#CEDBC8',borderRadius:4,marginTop:18,overflow:'hidden'},fill:{height:7,backgroundColor:'#54795D'},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8},section:{fontSize:18,fontWeight:'600',color:'#24372B'},add:{paddingVertical:12,paddingHorizontal:8},addText:{color:'#54795D',fontWeight:'700'},
  card:{backgroundColor:'#FFFFFF',borderRadius:18,padding:16,marginBottom:12,flexDirection:'row',alignItems:'center',gap:14},check:{width:46,height:46,borderWidth:2,borderRadius:15,alignItems:'center',justifyContent:'center'},checkmark:{fontSize:23,color:'#FFFFFF',fontWeight:'600'},habitBody:{flex:1},habitName:{fontSize:17,fontWeight:'600',color:'#24372B',marginBottom:4},edit:{padding:12,minHeight:44,justifyContent:'center'},editText:{color:'#54795D',fontWeight:'600'},
  empty:{paddingVertical:28},emptyTitle:{fontSize:21,color:'#24372B',fontWeight:'600',marginBottom:8},primary:{backgroundColor:'#54795D',padding:17,borderRadius:16,alignItems:'center',marginTop:24},primaryText:{fontSize:16,color:'#FFFFFF',fontWeight:'700'},
  calendar:{flexDirection:'row',flexWrap:'wrap',backgroundColor:'#FFFFFF',borderRadius:20,padding:10,marginBottom:16},day:{width:'14.285714%',alignItems:'center',justifyContent:'center',height:55},weekday:{color:'#66736A',fontWeight:'600'},date:{width:36,height:44,alignItems:'center',justifyContent:'center',borderRadius:12},completedDate:{backgroundColor:'#54795D'},todayDate:{borderWidth:2,borderColor:'#B8754D'},dateText:{color:'#24372B'},lightText:{color:'#FFFFFF'},dot:{fontSize:9,color:'#FFFFFF',marginTop:2},monthButton:{width:44,height:44,alignItems:'center',justifyContent:'center',backgroundColor:'#EAEDE6',borderRadius:14},
  label:{fontSize:15,fontWeight:'600',color:'#24372B',marginTop:28,marginBottom:10},input:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#D4DDD1',borderRadius:14,padding:16,fontSize:17,color:'#24372B'},swatches:{flexDirection:'row',gap:16},swatch:{width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center'},swatchSelected:{borderWidth:3,borderColor:'#24372B'},archive:{padding:18,alignItems:'center',marginTop:12},archiveText:{color:'#99543C',fontWeight:'600'},footer:{textAlign:'center',color:'#66736A',marginTop:28,fontSize:12},error:{color:'#99543C',padding:12,backgroundColor:'#FBECE3',borderRadius:12,marginTop:16}
});
