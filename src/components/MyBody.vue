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
        <h2 style="text-align: left;">{{ currentYear }}年{{ currentMonth }}月{{ selectDate() }}日のタスク</h2>
        <div class="todo-inputarea">
          <input type="text" v-model="addText" style="width: 40%; height: 29px; display: inline-block;" placeholder="タイトル">
          <!--<textarea v-model="addTextL" ref="addTxtArea" placeholder="メモを追加" :style="textareaStyle"></textarea>-->
          <button type="text" class="btn btn-primary btn-add" @click="addTodo" style="width: 10%;">追加</button>
          <!--全体、完了、未完了を切り替えるラジオボタン-->
          <input type="radio" name="todos" class="btn-check" id="option1" value="both" v-model="todoState">
          <label class="btn btn-outline-success" for="option1">全て</label>
          <input type="radio" name="todos" class="btn-check" id="option2" value="not-done" v-model="todoState">
          <label class="btn btn-outline-primary" for="option2">未完了</label>
          <input type="radio" name="todos" class="btn-check" id="option3" value="done" v-model="todoState">
          <label class="btn btn-outline-secondary" for="option3">完了</label>
        </div>
        <transition-group tag="ol" id="daily" v-if="todoState == 'both' ? true : false">
          <li v-show="!todo.hidden" class="list-group-item" id="daily-child" v-for="(todo, todoIndex) in textDataSet[2]" v-bind:key="todo.text"
          @mouseover="todo.hoverFlg = true" @mouseleave="todo.hoverFlg = false"
          :class="{done: todo.doneFlg}">{{ todo.text }}
            <!--メインテキスト表示ボタン-->
            <button v-show="todo.hoverFlg && !todo.textLFlg && !todo.doneFlg" type="text" 
            class="btn btn-outline-primary list-btn" @click="showTextL(todoIndex)" 
            :disabled="todo.disabled" style="position: absolute;right: 190px;">メモ</button>
            <!--完了していないタスクは完了ボタンが押せるようにする-->
            <button v-show="todo.hoverFlg && !todo.doneFlg" type="text" class="btn btn-outline-primary list-btn" 
            @click="makeDone(todoIndex)" :disabled="todo.disabled">完了</button>
            <!--完了したタスクは削除ボタンが押せるようにする-->
            <button v-show="todo.hoverFlg && todo.doneFlg" type="text" class="btn btn-secondary list-btn" 
            @click="deleteTodo(todoIndex)" :disabled="todo.diabled">削除</button>
            <!--優先順位を決めるドロップダウン-->
            <label v-show="todo.hoverFlg && !todo.doneFlg" for="priority" style="position: absolute;right: 85px;">優先度変更：</label>
            <select  v-show="todo.hoverFlg && !todo.doneFlg" type="number"  id="priority" v-model="todo.priority" 
            @change="changePriority(todoIndex)" :disabled="todo.disabled">
              <!--todoValidCount：未完了のtodoの数-->
              <option v-for="n in todoValidCount"  v-bind:key="n" v-bind:value="n">{{ n }}</option>
            </select>
          </li>
        </transition-group>
        <transition-group tag="ol" id="daily" v-if="todoState == 'not-done' ? true : false">
          <li v-show="!todo.hidden" class="list-group-item" id="daily-child" v-for="(todo, todoIndex) in todoNotDones" v-bind:key="todo.text"
          @mouseover="todo.hoverFlg = true" @mouseleave="todo.hoverFlg = false">{{ todo.text }}
            <!--メインテキスト表示ボタン-->
            <button v-show="todo.hoverFlg && !todo.textLFlg" type="text" class="btn btn-outline-primary list-btn" @click="showTextL(todoIndex)" :disabled="todo.disabled" style="position: absolute;right: 190px;">メモ</button> 
            <button v-show="todo.hoverFlg" type="text" class="btn btn-outline-primary list-btn" @click="makeDone(todoIndex)" :disabled="todo.disabled">完了</button>
            <label v-show="todo.hoverFlg" for="priority" style="position: absolute;right: 85px;">優先度変更：</label>
            <select  v-show="todo.hoverFlg" type="number"  id="priority" v-model="todo.priority" @change="changePriority(todoIndex)" :disabled="todo.disabled">
              <!--todoValidCount：未完了のtodoの数-->
              <option v-for="n in todoValidCount"  v-bind:key="n" v-bind:value="n">{{ n }}</option>
            </select>
          </li>
        </transition-group>
        <transition-group tag="ol" id="daily" v-if="todoState == 'done' ? true : false">
          <li class="list-group-item done" id="daily-child" v-for="(todo, todoIndex) in todoDones" v-bind:key="todo.text"
          @mouseover="todo.hoverFlg = true" @mouseleave="todo.hoverFlg = false">{{ todo.text }}
            <button v-show="todo.hoverFlg" type="text" class="btn btn-secondary list-btn" @click="deleteTodo(todoIndex)">削除</button>
          </li>
        </transition-group>
        <!--メモ表示領域-->
        <div v-if="editTextFlg">
          <textarea v-model="editTextL" placeholder="メモを追加" style="width: 70%;float: left;"></textarea>
          <!--メインテキスト表示中に表示 TODO:保存処理-->
          <button type="text" @click="saveTextL()">保存</button>
          <button tyep="text" @click="initListState()">戻る</button><!--TODO-->
        </div>
      </div>
    </div>
    <div id="child2">
      <div class="input-group">
        <div id="input-group1">
          <label for="taskName">長期タスク名</label>
          <input type="text" id="taskName" v-model="taskName">
        </div>
        <div id="input-group2">
          <label for="deadLine">期限：</label><datepicker id="deadLine" v-model="deadLine"/><button type="text" @click="addTask" class="btn btn-primary btn-add">追加</button> 
        </div>
      </div>
      <transition-group tag="ol" id="longTerm" v-if="taskCount">
        <!-- タスクと日付（期限）を表示-->
        <li class="list-group-item" id="long-term-child" v-for="(task, index) in tasks" v-bind:key="task.name" 
        @mouseover="task.delFlg = true" @mouseleave="task.delFlg = false">{{ task.name }}まであと{{ calcDeadLine(task.deadLine) }}日 期限：{{ formatDate(task.deadLine) }}
        <button v-show="task.delFlg" @click="delTask(index)" class="btn btn-secondary list-btn">削除</button>
        </li>
      </transition-group>
    </div>
  </div>
</template>

<script>
import {showCalendar, getYM, showNoteJs} from '../calendar';
import MyCalendar from './MyCalendar';
import Datepicker from 'vue3-datepicker';

export default {
  name: 'MyBody',
  data:function(){
      return{
        //カレンダーコンポーネントにバインド用
        rows2: [],
        taskCount: 0,
        taskName: '',
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
        //todo未完了リスト
        todoNotDones: [],
        //todo完了リスト
        todoDones: [],
        //リスティング表示フラグ
        listFlg: false,
        //追加テキスト
        addText: '',
        addTextL: '',
        addTextLHeight: "60px",
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
        currentDate: new Date().getDate(),
        //優先順位保持用
        selectedPriority: 0,
        deadLine: new Date(),
        deadLineArray: [],
        //todo進捗ラジオボタン用
        todoState: 'both',
        //編集用テキストL
        editTextL: '',
        editTextFlg: false,
        //表示中テキストインデックス
        shownTxtIdx: 0
      }
  },
  watch:{
    addTextL(){
      this.addTextLResize();
    },
    todoState(newVal, oldVal){
      if(this.editTextFlg){
        this.initListState(oldVal);
      }
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
    },
    textareaStyle(){
      return {'height': this.addTextLHeight};
    }
  },
  components:{
    MyCalendar,
    Datepicker
  },
  mounted(){
    this.rows2 = JSON.parse(localStorage.getItem('rows'));
    this.tasks = JSON.parse(localStorage.getItem('tasks'));
    if(this.tasks != null){
      this.taskCount = this.tasks.length;
      for(let i = 0; i < this.tasks.length; i++){
        this.tasks[i].deadLine = new Date(this.tasks[i].deadLine);
      }
      //期限切れタスク削除
      this.delOldTasks();
    }
    this.todoList = JSON.parse(localStorage.getItem('todoList'));
  },
  methods:{
    //メモ表示から戻る
    initListState(){
      if(this.todoState == 'both' || (arguments.length == 1 && arguments[0] == 'both')){
        for(let i = 0; i < this.textDataSet[2].length; i++){
          if(i <= this.shownTxtIdx){
            //disabledフラグを戻す
            this.textDataSet[2][i].disabled = false;
          }else if(i > this.shownTxtIdx){
            //非表示フラグを戻す
            this.textDataSet[2][i].hidden = false;
          }
        }
        //メモ表示フラグを戻す
        this.textDataSet[2][this.shownTxtIdx].textLFlg = false;
      }else if(this.todoState == 'not-done' || (arguments.length == 1 && arguments[0] == 'not-done')){
        for(let i = 0; i < this.todoNotDones.length; i++){
          if(i <= this.shownTxtIdx){
            //disabledを戻す
            this.todoNotDones[i].disabled = false;
          }else if(i > this.shownTxtIdx){
            //非表示フラグを戻す
            this.todoNotDones[i].hidden = false;
          }
        }    
        //メモ表示フラグをON
        this.todoNotDones[this.shownTxtIdx].textLFlg = false; 
      }
      //メモ用変数を初期化
      this.editTextL = '';
      //表示フラグを戻す
      this.editTextFlg = false;
    },
    //メモ保存
    saveTextL(){
      this.textDataSet[2][this.shownTxtIdx].textL = this.editTextL;
      this.todoNotDones[this.shownTxtIdx].textL = this.editTextL;

      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[this.shownTxtIdx].textL = this.editTextL;
      localStorage.setItem('rows',JSON.stringify(this.rows2));
      //ポップアップ表示
      this.$toast.show('保存しました。',{
        type: 'info',
        position: 'bottom-left',
        duration: 1400,
        pauseOnHover: false
      });
    },
    //メモ表示
    showTextL(todoIndex){
      this.shownTxtIdx = todoIndex;
      if(this.todoState == 'both'){
        for(let i = 0; i < this.textDataSet[2].length; i++){
          if(i <= todoIndex){
            //選択したtodo含めて上のtodoをdisabledにする
            this.textDataSet[2][i].disabled = true;
          }else if(i > todoIndex){
            //選択したtodoより下のtodoの非表示フラグをONにする
            this.textDataSet[2][i].hidden = true;
          }
        }
        //メモ用変数にバインド
        this.editTextL = this.textDataSet[2][todoIndex].textL;
        //メモ表示フラグをON
        this.textDataSet[2][todoIndex].textLFlg = true;
      }else if(this.todoState == 'not-done'){
        for(let i = 0; i < this.todoNotDones.length; i++){
          if(i <= todoIndex){
            //選択したtodoより上のtodoをdisabledにする
            this.todoNotDones[i].disabled = true;
          }else if(i > todoIndex){
            //選択したtodoより下のtodoの非表示フラグをONにする
            this.todoNotDones[i].hidden = true;
          }
        }
        //メモ用変数にバインド
        this.editTextL = this.todoNotDones[todoIndex].textL;     
        //メモ表示フラグをON
        this.todoNotDones[todoIndex].textLFlg = true;   
      }
      //表示フラグをONにする
      this.editTextFlg = true;
    },
    addTextLResize(){
      this.addTextLHeight = 'auto';
      this.$nextTick(()=>{
          this.addTextLHeight = this.$refs.addTxtArea.scrollHeight + 'px';
        })
    },
    formatDate(currentDate){
      let formattedDate = currentDate.getFullYear() + '年'
                        + (currentDate.getMonth() + 1) + '月' 
                        + (currentDate.getDate()) + '日';

      return formattedDate;
    },
    twoDigit(value){
      return ('0' + value).slice(-2);
    },
    //期限切れのタスク削除処理
    delOldTasks(){
      var delCount = 0;
      var todayYMD = new Date(this.currentYear, this.currentMonth - 1, this.currentDate);
      var forLength = this.tasks.length;
      for(let i = 0; i < forLength; i++){
        var diffMilliSec = this.tasks[i - delCount].deadLine - todayYMD;
        if(diffMilliSec < 0){
          this.tasks.splice(i - delCount, 1);
          delCount++;
        }
      }
    },
    //todoソート用
    todoSort(todo1,todo2){
      return todo1.priority - todo2.priority;
    }, 
    //優先順位変更処理 TODO:優先順位の同期をとる && メインテキスト実装
    changePriority(todoIndex){
      let selectedPriority = '';
      if(this.todoState == 'both'){
        selectedPriority = this.textDataSet[2][todoIndex].priority;
        //優先度が変わらない場合は最初にリターン
        if(selectedPriority == (todoIndex + 1)){
          return;
        }
        this.todoNotDones[todoIndex].priority = selectedPriority;
      }else if(this.todoState == 'not-done'){
        selectedPriority = this.todoNotDones[todoIndex].priority;
        //優先度が変わらない場合は最初にリターン
        if(selectedPriority == (todoIndex + 1)){
          return;
        }
        this.textDataSet[2][todoIndex].priority = selectedPriority;
      }
      //優先順位のズレを直す処理（優先度が上がる、下がるそれぞれズレの直し方が違う）
      //現在位置より上の優先度が選択された場合
      //i.g.優先度４→２の場合、selectedPriority:2 todoIndex:3 移動対象は２
      if(selectedPriority < (todoIndex + 1)){
        for(let i = (selectedPriority - 1); i < todoIndex; i++){
          this.textDataSet[2][i].priority++;
          this.todoNotDones[i].priority++;
          this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority++;
        }
      //現在位置より下の優先度が選択された場合
      //i.g.優先度２→４の場合、selectedPriority:４ todoIndex:１ 移動対象は２
      }else{
        for(let i = (todoIndex + 1); i < selectedPriority; i++){
          this.textDataSet[2][i].priority--;
          this.todoNotDones[i].priority--;
          this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;
        }
      }
      //選択された行の優先度を更新
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[todoIndex]
        .priority = selectedPriority;

      //バインド対象を優先順位でソート
      this.textDataSet[2].sort(this.todoSort);
      this.todoNotDones.sort(this.todoSort);
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.sort(this.todoSort);
      //ソートした内容でストレージにセット
      localStorage.setItem('rows',JSON.stringify(this.rows2));
    },
    //タスク削除処理
    deleteTodo(delIndex){
      if(this.todoState == 'both'){
        //完了モードから削除する用
        let delTodoTxt = this.textDataSet[2][delIndex].text;
        let delIndex2 = 0;
        let delPosFlg = false;
        while(!delPosFlg){
          if(this.todoDones[delIndex2].text == delTodoTxt){
            this.todoDones.splice(delIndex2, 1);
            delPosFlg = true;
          }else{
            delIndex2++;          
          }
        }
        for(let i = delIndex2; i < this.todoDones.length; i++){
            this.todoDones[i].priority--;
        }

        this.textDataSet[2].splice(delIndex, 1);
        this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.splice(delIndex, 1);
        //ずれている優先順位を修正
        //最後尾を削除する場合以外で、後続の優先度をー１する
        if(delIndex != this.textDataSet[2].length){
          for(let i = delIndex; i < this.textDataSet[2].length; i++){
            this.textDataSet[2][i].priority--;
            this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;      
          }
        }
      }else if(this.todoState == 'done'){
        //完了リスト内で削除された際の処理
        //全表示モードでの削除
        let delTodoTxt = this.todoDones[delIndex].text;
        let delIndex2 = 0;
        let delPosFlg = false;
        while(!delPosFlg){
          if(this.textDataSet[2][delIndex2].text == delTodoTxt){
            this.textDataSet[2].splice(delIndex2, 1);
            this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.splice(delIndex2, 1);
            delPosFlg = true;
          }else{
            delIndex2++;          
          }
        }
        for(let i = delIndex2; i < this.textDataSet[2].length; i++){
            this.textDataSet[2][i].priority--;
            this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;      
        }

        //完了モードの削除
        this.todoDones.splice(delIndex, 1);
        //優先度ズレ調整
        for(let i = delIndex; i < this.todoDones.length; i++){
            this.todoDones[i].priority--;
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
      //未完了モードから削除
      this.todoNotDones.splice(taskIndex, 1);
      //完了モードに追加
      this.todoDones.push({...this.textDataSet[2][taskIndex]});
      //順位をずらす
      for(var i = 0; i < this.textDataSet[2].length; i++){
        if(i != taskIndex){
          if(i > taskIndex){
            this.textDataSet[2][i].priority--;
            this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList[i].priority--;       
          }
        }
        if(i >= taskIndex && i <= this.todoNotDones.length - 1){
          this.todoNotDones[i].priority--;
        }
      }
      //優先度でソート
      this.textDataSet[2].sort(this.todoSort);
      this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.sort(this.todoSort);
      //ローカルストレージを更新
      localStorage.setItem('rows',JSON.stringify(this.rows2));
    },
    //タスク追加処理
    addTask(){
      this.deadLineToAdd = this.deadLine;
      if(!this.isValid('longTerm')){
        return;
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
      var todayYMD = new Date(this.currentYear, this.currentMonth - 1, this.currentDate);
      // console.log('todayYMD:' + todayYMD);
      // console.log('deadLine:' + deadLine);
      var diffMilliSec = deadLine - todayYMD;
      //console.log('diffMilliSec:' + diffMilliSec);
      /*ミリ秒を日数に変換*/
      var diffDays = parseInt(diffMilliSec / 1000 / 60 / 60 / 24);
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
      //メモ領域初期化
      if(this.editTextFlg){
        this.initListState();
      }
      //有効な日付かを判断
      if(!dataSet[3]){//dataSet[3]：今月の日付フラグ
        //これがないと挙動がおかしい
        this.textDataSet = [0,0,[]];
        this.listFlg = false;
        return;
      }
      this.textDataSet = dataSet;
      let tempTodoList = [];
      tempTodoList = this.textDataSet[2];
      //todo完了、未完了リスト格納 2022/5/14 値渡しになっているか不安・・・
      //完了、未完了リフレッシュ
      this.todoDones = [];
      this.todoNotDones = [];
      //todo切り替え用セット
      if(tempTodoList.length != 0){
        for(let i = 0; i < tempTodoList.length; i++){
          if(this.textDataSet[2][i].doneFlg){
            this.todoDones.push({...tempTodoList[i]});
          }else{
            this.todoNotDones.push({...tempTodoList[i]});
          }
        }
      }
      tempTodoList = null;
      this.listFlg = true;
    },
    //todo入力チェック taskType:'daily' OR 'longTerm'
    isValid(taskType){
      if(taskType == 'daily'){
        if(this.addText == null || this.addText.trim() == ''){
          alert('タスク名を入力してください');
          return false;
        }
        if(this.addText.length > 20){
          alert('タスク名は20文字以下にしてください');
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
    //リストにtodo追加 TODO:textL実装
    addTodo(){
      if(!this.isValid('daily')){
        this.addText = '';
        return;
      }
      this.rows2 = JSON.parse(localStorage.getItem('rows'));
      //todoリスト配列部分の要素はオブジェクト
      var tempTodo = {
        text: this.addText,
        textL: this.addTextL,
        textLFlg: false,
        doneFlg: false,
        priority: 1,
        //マウスホバー時フラグ
        hoverFlg: false,
        disabled: false,
        hidden: false
      };
      //未完了モード用にセット
      tempTodo.priority = this.todoNotDones.length + 1;
      this.todoNotDones.push({...tempTodo});

      tempTodo.priority = 1;
      //該当日付のtodo追加が初回の場合
      if(this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.length == 0){
        this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.push({...tempTodo});
        //画面用にバインド
        this.textDataSet[2].push({...tempTodo});
        tempTodo = null;
      }else{
        //最後尾の優先順位＋１をpriorityにセットする
        var arrayLength = this.rows2[this.textDataSet[0]][this.textDataSet[1]].todoList.length;
        var tempTodo2 = {
          text: this.addText,
          textL: this.addTextL,
          textLFlg: false,
          doneFlg: false,
          priority: arrayLength + 1,//優先順位最下位として登録
          hoverFlg: false,
          disabled: false,
          hidden: false
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
@media screen and (min-width: 1501px){
  #parent {
    display: flex;
    margin-top: 40px;
    margin-left: 150px;
    margin-right: 150px;
    margin-bottom: 40px;
  }
  #child1 {
    width: 55%;
    margin-right: 20px;
    padding-right: 30px;
  }
  #child2 {
    width: 45%; 
  }
  #child2 .input-group,{
    display: flex;
  }
  #input-group2{
    display: flex;
  }
}
@media screen and (max-width: 1500px){
  #parent {
    display: flex;
    margin-top: 40px;
    margin-left: 150px;
    margin-right: 150px;
    margin-bottom: 40px;
  }
  #child1 {
    width: 55%;
    margin-right: 20px;
    padding-right: 30px;
  }
  #child2 {
    display: flex;
    flex-flow: column;
    width: 45%;
  }
  #input-group1,#input-group2{
    display: flex;
  }
}
@media screen and (max-width: 1000px){
    #parent {
    display: flex;
    flex-direction: column;
    margin-top: 40px;
    margin-left: 150px;
    margin-right: 150px;
    margin-bottom: 40px;
  }
  #child1{
    width: 100%;
    padding: 60px;
  }
  #child2{
    width: 100%;
    padding: 60px;
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
  /*width: 25%;*/
  display: inline-block;
  /*width: 100%;*/
}
select{
  position: absolute;
  right: 65px;
}
.today{
  background-color: red;
}
.list-group-item{
   padding-left:60px;text-align: left;
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
#daily-child{
  box-shadow: 4px 5px 0 0 #e8e1d2;
}
#long-term-child{
  box-shadow: 4px 5px 0 0 #e8e1d2;
}
/*長期目標用*/
ol li#long-term-child::before {
  position: absolute;
  left: 0;
  font-family: "Font Awesome 5 Free"; 
  font-weight: 900; 
  content: '\f19d';/*'\f520';/*'\f46c';*/
  color: black;
}
/*todo用*/
ol li#daily-child::before {
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
  letter-spacing: 0;
  width: 100%;
  text-align: left;
  margin-top: 5px;
}
.v-enter-active, .v-leave-active, .v-move {
  transition: transform 0.2s;
}
.v-enter-from, .v-leave-to {
  transform: translateY(50%);
}
</style>