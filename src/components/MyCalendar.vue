<template>
    <div id="calendar">
    <table class="table">
        <tr style="background-color: #f6f5f4;">
            <!--<th v-for="day in week" v-bind:key="day">{{ day }}</th>-->
            <th class="sunday" scope="col">SUN</th>
            <th scope="col">MON</th>
            <th scope="col">TUE</th>
            <th scope="col">WED</th>
            <th scope="col">THU</th>
            <th scope="col">FRI</th>
            <th class="saturday" scope="col">SAT</th>
        </tr>
        <tr v-for="(row, index) in rows" v-bind:key="index">
            <!-- dateProps {date:日付 background:背景色 todoList:todoリスト} -->
            <td v-for="(dateProps, index2) in row" v-bind:key="index2" 
            :class="[dateProps.day, dateProps.background, dateProps.hoverFlg && dateProps.isValid? 'hover':'']" 
            @click="showNote(index, index2, dateProps.todoList, dateProps.isValid)"
            @mouseover="dateProps.hoverFlg = true" @mouseleave="dateProps.hoverFlg = false">
                {{ dateProps.date }}
            </td>
        </tr>
    </table>
    </div>
</template>

<script>
import {showCalendar} from '../calendar'

export default{
    name: 'MyCalendar',
    data:function(){
        return{
            rows: [],
            //week: week,
            period: '',
            textAreaFlg: false,
            currentText: ''
        }
    },
    mounted(){
        this.readCalendar();
        this.$emit("cal_mounted", this.rows);
    },
    methods:{
       //日付クリック処理（マッピングされたテキストを表示する）
       showNote(index, index2, todoList, isValid){
           var dataSet = [];
           dataSet.push(index);
           dataSet.push(index2);
           dataSet.push(todoList);
           dataSet.push(isValid);
           this.$emit("show-text", dataSet);
       },
       //mount後のカレンダー読み込み
       readCalendar(){
           //localStorage.removeItem("rows")
           //localStorage.removeItem("period")
            var today = new Date()
            var todayStr = today.getFullYear().toString() + (today.getMonth() + 1)
            //初回訪問 or 初月に当月カレンダー用配列取得
            this.rows = JSON.parse(localStorage.getItem('rows'));
            this.period = localStorage.getItem('period');

            if(this.rows == null){
                //初回訪問時
                this.rows = showCalendar();
                this.period = todayStr
                //ローカルストレージに永続化
                localStorage.setItem('rows',JSON.stringify(this.rows));
                localStorage.setItem('period',todayStr);
            }else if(todayStr != this.period){
                //初月訪問時
                this.rows = showCalendar();
                this.period = todayStr;
                localStorage.setItem('rows',JSON.stringify(this.rows));
                localStorage.setItem('period',todayStr);
            }else{
                //この処理はいらない
                this.rows = JSON.parse(localStorage.getItem('rows'));
                //当日日付をチェック、更新する
                for(var i = 0; i < this.rows.length; i++){
                    for(var j = 0; j < this.rows[0].length; j++){
                        if(this.rows[i][j].background == 'gold'){
                            //当日ではない背景をノーマルに戻す
                            if(this.rows[i][j].date != today.getDate()){
                                this.rows[i][j].background = 'normalcolor';
                            }
                        }else if(this.rows[i][j].background == 'normalcolor'){
                            //当日でノーマル背景を当日背景にセットする
                            if(this.rows[i][j].date == today.getDate()){
                                this.rows[i][j].background = 'gold';
                            }
                        }
                    }
                }
                this.period = localStorage.getItem('period');
            }      
            //this.rows = showCalendar(); 

            //localStorage.setItem('rows',JSON.stringify(this.rows));
       }
    }
}
</script>
<style>
.silver{
    background-color: silver;
}
.gold{
    background-color: gold;    
}
.normalcolor{
    background-color: #f6f5f4;
}
.sunday{
    color: red;
}
.saturday{
    color: blue;
}
.normalday{
    color: black;
}
.hover{
    background-color: lightblue;
}
table {
    outline: 2px solid #ddd;
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
}
th, td {
    outline: 1px solid #ddd;
    padding: 10px;
    /* padding-top: 10px;
    padding-bottom: 10px; */
    text-align: center;
    
} 
th {
  font-weight: normal;
  font-size: 14px;
}
td {
  font-weight: bold;
}
#calendar {
    text-align: center;
    width: 100%;
}
</style>