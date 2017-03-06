/**
 * Created by kuni on 2017/03/06.
 */

// Jqueryが使えます。
import $ from 'jquery';

export default class Common {

    //region property
    static get prop1(){
        return 1;
    }
    //endregion
    constructor(){
        super.constructor();
    }
    method1(num){
        return num + 1;
    }
}
