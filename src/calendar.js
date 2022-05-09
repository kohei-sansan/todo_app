import { createSequenceExpression } from '@vue/compiler-core';
import showNote from './components/MyBody';

const today = new Date();

//カレンダー表示
const showCalendar = function(){
    var year = today.getFullYear();
    var month = today.getMonth();

    return createCalendar(year, month);
}
//年月取得用
const getYM = function(){
    var ymArray = [];
    ymArray.push(today.getFullYear());
    ymArray.push(today.getMonth() + 1);

    return ymArray;
}

//カレンダー作成
function createCalendar(year, month){
    //2022/5/1 add
    var rows = [];
    //日付格納用
    var dates = [];

    var count = 0;
    var firstDay = new Date(year, month, 1).getDay();
    var lastDate = new Date(year, month + 1, 0).getDate();
    //先月の末日取得
    var lastMonthEndDate = new Date(year, month, 0).getDate();

    //カレンダーに必要な行数
    var row = Math.ceil((firstDay + lastDate) / 7);

    for(var i = 0; i < row; i++){
        dates = [];
        for(var j = 0; j < 7; j++){
            var dateProps = {
                date: 0,
                day: '',
                background: '',
                isValid: false,
                todoList: [],
                hoverFlg: false
            };
            if(j == 0 || j == 6){
                if(j == 0){
                    dateProps.day = 'sunday';
                }else{
                    dateProps.day = 'saturday';
                }
            }else{
                dateProps.day = 'normalday';
            }
            //１行目の前月分の日付を表示
            if(i == 0 && j < firstDay){
               dateProps.date = (lastMonthEndDate - firstDay + j + 1);
               //背景変更用
               dateProps.background = 'silver';
            //最終行の来月分の日付を表示
            }else if(count >= lastDate){
                count++;
                //calendar += "<td class='disabled'>" + count + "</td>";
                dateProps.date = count - lastDate;
                //disabledフラグ
                dateProps.background = 'silver';
            }else{
                count++;
                //当日を意識する
                if(year == today.getFullYear()
                    && month == today.getMonth()
                    && count == today.getDate()){
                    dateProps.date = count;
                    //disabledはfalse
                    dateProps.background = 'gold';
                }else{
                    dateProps.date = count;
                    //disabledはfalse
                    dateProps.background = 'normalcolor';
                }
                dateProps.isValid = true;
            }
            dates.push(dateProps);
        }
        rows.push(dates);
    }
    return rows;
}

export  {showCalendar, getYM};