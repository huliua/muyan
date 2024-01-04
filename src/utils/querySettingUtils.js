import $ from 'jquery';
import { isBlank } from '@/utils/commonUtils';
/**
 * 获取查询条件
 * @param {Array} defaultQuery 默认查询条件
 * @param {Object} queryFormObj 查询条件表单
 * @example 
 * queryFormObj: {
    menuName: {
        value: '',
        name: 'menu_name',
        builder: 'like'
    },
    status: {
        value: '',
        name: 'status',
        builder: 'in'
    }
}
 */
export function getQuerySetting(defaultQuery, queryFormObj) {
    var finalQuery = [];
    if (defaultQuery) {
        $.extend(true, finalQuery, defaultQuery);
    }
    if (queryFormObj) {
        $.each(Object.keys(queryFormObj), function (index, key) {
            if (isBlank(queryFormObj[key]["value"])) {
                return;
            }
            finalQuery.push({
                "name": queryFormObj[key]["name"] || key,
                "builder": queryFormObj[key]["builder"],
                "value": queryFormObj[key]["value"]
            });
        });
    }
    return JSON.stringify(finalQuery);
}