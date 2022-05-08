<template>
  <div id="parent">
    <div id="child1">
      <!--カレンダーを表示する-->
      <!-- xxxx年xx月を表示 -->
      <h1>{{ currentYear }}年{{ currentMonth }}月</h1>
      <!--カレンダー本体-->
      <MyCalendar @show-text="receiveDataSet" @cal_mounted="rows2 = $event" v-bind:rows="rows2"></MyCalendar>
      <!--選択された日付のtodoリスト表示 コンポーネントで管理する予定-->
      <div v-show="listFlg">
        <h2>{{ currentYear }}年{{ currentMonth }}月{{ selectDate() }}日のタスク</h2>
        <div class="todo-inputarea">
          <input type="text" v-model="addText" style="width: 220px; height: 29px;">
          <button type="text" class="btn btn-primary btn-add" @click="addTodo">追加</button>
        </div>
        <!--<ol class="list-group">-->
        <transition-group tag="ol" id="daily">
          <li class="list-group-item" id="daily" v-for="(todo, todoIndex) in textDataSet[2]" v-bind:key="todo.text"
          @mouseover="todo.hoverFlg = true" @mouseleave="todo.hoverFlg = false"
          :class="{done: todo.doneFlg}">{{ todo.text }}
            <!--完了ボタン、削除ボタン、優先度コンボボックス 実装する-->
            <!--完了していないタスクは完了ボタンが押せるようにする-->
            <button v-show="todo.hoverFlg == true && !todo.doneFlg" type="text" class="btn btn-outline-primary list-btn" @click="makeDone(todoIndex)">完了</button>
            <!--完了したタスクは削除ボタンが押せるようにする-->
            <button v-show="todo.hoverFlg == true && todo.doneFlg" type="text" class="btn btn-secondary list-btn" @click="deleteTodo(todoIndex)">削除</button>
            <!--優先順位を決めるドロップダウン-->
            <label v-show="todo.hoverFlg == true && !todo.doneFlg" for="priority">優先度変更：</label>
            <select  v-show="todo.hoverFlg == true && !todo.doneFlg" type="number" v-model="selectedPriority" id="priority" @change="changePriority(todoIndex)">
              <!--todoValidCount：未完了のtodoの数-->
              <option v-for="n in todoValidCount" v-bind:value="n" v-bind:key="n">{{ n }}</option>
            </select><!--TODO 優先度ドロップダウンの数は、未完了の分だけにする-->
          </li>
        </transition-group>
      </div>
    </div>
    <div id="child2">
      <label for="taskName">タスク名</label>
      <input type="text" id="taskName" v-model="taskName">
      <label for="deadLine">期限：</label>
      <input type="date" id="deadLine" v-model="deadLine">
      <button type="text" @click="addTask" class="btn btn-primary btn-add">追加</button>      
      <!--<ol class="list-group" v-if="taskCount">-->
      <transition-group tag="ol" id="longTerm" v-if="taskCount">
        <!-- タスクと日付（期限）を表示-->
        <li class="list-group-item" id="longTerm" v-for="(task, index) in tasks" v-bind:key="task.name" 
        @mouseover="task.delFlg = true" @mouseleave="task.delFlg = false">{{ task.name }}まであと{{ calcDeadLine(task.deadLine) }}日
        <button v-show="task.delFlg" @click="delTask(index)" class="btn btn-secondary list-btn">削除</button>
        </li>
      <!--</ol>-->
      </transition-group>
    </div>
  </div>
  
</template>

<script>
import {showCalendar, getYM, showNoteJs} from '../calendar';
import MyCalendar from './MyCalendar';

export default {
  name: 'MyBody',
  data:function(){
      return{
        //カレンダーコンポーネントにバインド用
        rows2: [],
        taskCount: 0,
        taskName: '',
        deadLine: '',
        deadLineArray: [],
        //タスク配列
        tasks:[],
        deadLineToAdd: null,
        //カレンダーと紐付けるtodoリスト
        todoList:[],
        todoTextFlg: false,
        todoText: '',
        calendarStr: '',
        //カレンダーから取得した日付＆テキスト
        textDataSet: [0,0,[]],
        //リスティング表示フラグ
        listFlg: false,
        //追加テキスト
        addText: '',
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
        //優先順位保持用
        selectedPriority: 0
      }
  },
  computed:{
    todoValidCount(){
      var count = 0;
      for(let i = 0; i < this.textDataSet[2].length; i++){
        if(!this.textDataSet[2][i].doneFlg){
          count++;
        }
      }
      return count;
    }
  },
  components:{
    MyCalendar
  },
  mounted(){
    this.rows2 = JSON.parse(localStorage.getItem('rows'));
    this.tasks = JSON.parse(localStorage.getItem('tasks'));
    if(this.tasks != null){
      this.taskCount = this.tasks.length;
      for(let i = 0; i < this.tasks.length; i++){
        this.tasks[i].deadLine = new Date(this.tasks[i].deadLine);
      }
    }
    //this.tasks = null;
    //localStorage.setItem('tasks',JSON.stringify(this.tasks));
    this.todoList = JSON.parse(localStorage.getItem('todoList'));
  },
  methods:{
    //todoソート用
    todoSort(todo1,todo2){
      return todo1.priority - todo2.priority;
    }, 
    //優先順位変更処理
    changePriority(todoIndex){
      //優先度が変わらない場合は最初にリターン
      if(this.selectedPriority == (todoIndex + 1)){
        return;
      }
      //優先順位のズレを直す処理（優先度が上がる、下がるそれぞれズレの直し方が違う）
      //現在位置より上の優先度が選択された場合
      //i.g.優先度４→２の場合、selectedPriority:2 todoIndex:3 移動対象は２
      if(this.selectedPriority < (todoIndex + 1)){
        for(let i = (this.selectedPriority - 1); i < todoIndex; i++){
          this.textDataSet[2][i].priority++;
          this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority++;
        }
      //現在位置より下の優先度が選択された場合
      //i.g.優先度２→４の場合、selectedPriority:４ todoIndex:１ 移動対象は２
      }else{
        for(let i = (todoIndex + 1); i < this.selectedPriority; i++){
          this.textDataSet[2][i].priority--;
          this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;
        }
      }
      //選択された行の優先度を更新
      this.textDataSet[2][todoIndex].priority = this.selectedPriority;
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[todoIndex]
        .priority = this.selectedPriority;
      //バインド対象を優先順位でソート
      this.textDataSet[2].sort(this.todoSort);
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.sort(this.todoSort);
      //ソートした内容でストレージにセット
      localStorage.setItem('rows',JSON.stringify(this.rows2));
      
      this.selectedPriority = 0;
    },
    //タスク削除処理
    deleteTodo(delIndex){
      this.textDataSet[2].splice(delIndex, 1);
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.splice(delIndex, 1);
      //ずれている優先順位を修正
      //最後尾を削除する場合以外で、後続の優先度をー１する
      if((delIndex + 1) != (this.textDataSet[2].length + 1)){
        for(let i = delIndex; i < this.textDataSet[2].length; i++){
          this.textDataSet[2][i].priority--;
          this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;      
        }
      }
      //ローカルストレージを更新
      localStorage.setItem('rows',JSON.stringify(this.rows2));
    },
    //タスク完了処理
    makeDone(taskIndex){
      //完了フラグをtrueにする
      this.textDataSet[2][taskIndex].doneFlg = true;
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[taskIndex].doneFlg = true;
      //優先順位を最下位にする
      var lastIndex = this.textDataSet[2].length - 1;
      // var fromPriority = this.textDataSet[2][taskIndex].priority;
      var lastPriority = this.textDataSet[2].length;
      //完了したタスクを最下位にする
      this.textDataSet[2][taskIndex].priority = lastPriority;
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[taskIndex].priority = lastPriority;
      //順位をずらす
      for(var i = 0; i < this.textDataSet[2].length; i++){
        if(i != taskIndex){
          if(i > taskIndex){
            this.textDataSet[2][i].priority--;
            this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;       
          }
        }
      }
      //優先度でソート
      this.textDataSet[2].sort(this.todoSort);
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.sort(this.todoSort);
      //ローカルストレージを更新
      localStorage.setItem('rows',JSON.stringify(this.rows2));
    },
    //タスク追加処理 TODO 入力チェック追加
    addTask(){
      //this.deadLine:'2022-05-06'
      var deadLineArray = [];
      deadLineArray = this.deadLine.split('-');
      deadLineArray[1].replace('0','');
      deadLineArray[1] = (parseInt(deadLineArray[1]) - 1);
      //var deadLine = new Date(this.deadLine);
      this.deadLineToAdd = new Date(deadLineArray[0],deadLineArray[1],deadLineArray[2]);
      if(!this.isValid('longTerm')){
        return; //TODO 長期目標の入力チェック処理から
      }
      if(this.tasks == null){
        this.tasks = [{name:this.taskName,deadLine: this.deadLineToAdd,delFlg: false}];
      }else{
        this.tasks.push({name: this.taskName, deadLine: this.deadLineToAdd,delFlg: false});
      }
      this.deadLineToAdd = '';
      this.taskName = '';

      //ローカルストレージに永続化
      localStorage.setItem('tasks',JSON.stringify(this.tasks));
      //カウントアップ
      this.taskCount++;
    },
    //タスク削除処理
    delTask(index){
      this.tasks.splice(index, 1);
      //ローカルストレージに永続化
      localStorage.setItem('tasks',JSON.stringify(this.tasks));
    },
    //あと何日かを算出する
    calcDeadLine(deadLine){
      //タスク実行日にちまで後何日かを返す
      var today = new Date();
      //console.log('today:'+today);
      var nextDay = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate() + 1);
      //console.log('nextDay:'+nextDay);
      //今日の残り時間
      var remainingTime = nextDay - today;
      //TODO:残り１日の処理・・・
      var diffMilliSec = deadLine - today;
      //console.log('remainingTime:'+remainingTime);
      //console.log('diffMillSec:'+diffMilliSec);
      if(diffMilliSec < 0){
          //タスクの削除（仮）
            
      }
      /*ミリ秒を日数に変換*/
      var diffDays = parseInt(diffMilliSec / 1000 / 60 / 60 / 24);
      //チェック（必要に応じて、削除も）
      if(diffDays == 0){
          //あと何時間を返す
      }
      if(diffDays == 0 && diffMilliSec >= remainingTime){
        diffDays = 1;
      }
      // 残り日数を返す
      return diffDays;
    },
    //日付に対応するメモを取得する
    showNote(date){
      this.todoTextFlg = true;
      //初回読み込み時
      if(this.todoList.length == null){
        var ymParams = [];
        ymParams = getYM();
        var lastDate = (new Date(ymParams[0],ymParams[1],0)).getDate();
        //テキスト初期化
        for(var i = 0; i < lastDate; i++){
          this.todoList.push({date: i + 1,text: ''});
        }
      }
      this.todoTextFlg = true;
      //return this.todoList[date - 1];//.text;
    },
    //カレンダーからデータセット受け取り
    receiveDataSet(dataSet){
      //有効な日付かを判断
      if(!dataSet[3]){//dataSet[3]：今月の日付フラグ
        //これがないと挙動がおかしい
        this.textDataSet = [0,0,[]];
        this.listFlg = false;
        return;
      }
      this.textDataSet = dataSet;
      this.listFlg = true;
    },
    //todo入力チェック taskType:'daily' OR 'longTerm'
    isValid(taskType){
      if(taskType == 'daily'){
        if(this.addText == null || this.addText.trim() == ''){
          alert('タスク名を入力してください');
          return false;
        }
        if(this.addText.length > 15){
          alert('タスク名は15文字以下にしてください');
          return false;
        }
        for(let i = 0; i < this.textDataSet[2].length; i++){
          if(this.textDataSet[2][i].text == this.addText){
            //重複メッセージ表示して、return
            alert('登録されてます。。');
            return false;
          }
        }
      }else if(taskType == 'longTerm'){
        if(this.tasks == null){
          return true;
        }
        let today = new Date(this.currentYear, this.currentMonth - 1, new Date().getDate());
        if(this.deadLineToAdd < today){
          alert('本日日付より前は指定できません');
          return false;
        }
        if(this.taskName == null||this.taskName.trim() == ''){
          alert('タスク名を入力してください');
          return false;
        }
        if(this.taskName.length > 15){
          alert('タスク名は15文字以下にしてください');
          return false;
        }
        for(let i = 0; i < this.tasks.length; i++){
          if(this.taskName == this.tasks[i].name){
            alert('登録されてます。。');
            return false;
          }
        }
      }
      return true;
    },
    //リストにtodo追加
    addTodo(){
      if(!this.isValid('daily')){
        this.addText = '';
        return;
      }
      this.rows2 = JSON.parse(localStorage.getItem('rows'));

      //該当日付のtodo追加が初回の場合
      if(this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.length == 0){
        //todoリスト配列部分の要素はオブジェクト
        var tempTodo = {
          text: this.addText,
          doneFlg: false,
          priority: 1,
          //マウスホバー時フラグ
          hoverFlg: false
        };
        this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.push({...tempTodo});
        //画面用にバインド
        this.textDataSet[2].push({...tempTodo});
        tempTodo = null;
      }else{
        //最後尾の優先順位＋１をpriorityにセットする
        var arrayLength = this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.length;
        var tempTodo2 = {
          text: this.addText,
          doneFlg: false,
          priority: arrayLength + 1,//優先順位最下位として登録
          hoverFlg: false
          //for用id
          //id: 0
        };

        //完了が存在する場合は、その中間にtodo挿入する
        if(this.textDataSet[2][arrayLength - 1].doneFlg == true){
          var tempPos = 0;
          for(let i = 0; i < arrayLength; i++){
            if(this.textDataSet[2][i].doneFlg == true){
              tempPos = i;
              tempTodo2.priority = i + 1;
              this.textDataSet[2].splice(i,0,{...tempTodo2});
              this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.splice(i,0,{...tempTodo2});
              break;
            }
          }
          //後続の完了済みタスクの優先度を＋１する
          for(let i = tempPos + 1; i < this.textDataSet[2].length; i++){
            this.textDataSet[2][i].priority++;
            this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority++;
          }
        //完了のタスクがない場合は、そのまま最後尾に追加  
        }else{
          tempTodo2.id = arrayLength + 1;
          this.textDataSet[2].push({...tempTodo2});
          this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.push({...tempTodo2});
        }

        tempTodo2 = null;
      }
      //ローカルストレージに永続化
      localStorage.setItem('rows',JSON.stringify(this.rows2));
      //画面クリア
      this.addText = '';
    },
    //選択された日付を取得する
    selectDate(){
      var tempRows = JSON.parse(localStorage.getItem('rows'));
      //ブラウザでの不具合対応
      if(tempRows != null){
        return tempRows[this.textDataSet[0]][this.textDataSet[1]].date;
      }else{
        return 0;
      }
    }
  }
}
</script>

<style scoped>
@media (min-width: 900px) {
  #parent {
    display: flex;
    padding: 10px;
    margin-top: 30px;
    margin-left: 100px;
    margin-right: 100px;
  }
  #child1 {
    width: 55%;
    margin-right: 20px;
    padding-right: 30px;
  }
  #child2 {
    width: 45%;
    margin-left: 20px;
  }
}
button{
  padding: 1px;
}
button.list-btn{
  position: absolute;
  right: 0;
  width: 60px;
  height: 30px;
}
.btn-add{
  height: 30px;
  width: 48px;
  font-size: 15px;
}
input#deadLine{
  height: 30px;
}
select{
  height: 20px;
}
.today{
  background-color: red;
}
ol#daily {
  padding-left: 0;
  padding-top: 10px;
  line-height: 1.5;
  list-style-type: none!important;
} 

ol#longTerm {
  padding-left: 0;
  padding-top: 10px;
  line-height: 1.5;
  margin:10px;
  list-style-type: none!important;
}  
/*長期目標用*/
ol li#longTerm::before {
  position: absolute;
  left: 0;
  font-family: "Font Awesome 5 Free"; 
  font-weight: 900; 
  content: '\f19d';/*'\f520';/*'\f46c';*/
  color: black;
}
/*todo用*/
ol li#daily::before {
  position: absolute;
  left: 0;
  font-family: "Font Awesome 5 Free"; 
  font-weight: 900; 
  content: '\f0f4';/*'\f520';/*'\f46c';*/
  color: black;
}
.fa {
  -webkit-font-smoothing:antialiased;
  -webkit-text-stroke-color: white;
  -webkit-text-stroke-width:1px
}
.done{
  background-color: whitesmoke;
  color: darkgray;
  text-decoration: line-through;
}
.todo-inputarea{
  margin-top: 5px;
}
.v-enter-active, .v-leave-active, .v-move {
  transition: transform 0.5s;
}
.v-enter-from, .v-leave-to {
  transform: translateX(50%);
}
</style>