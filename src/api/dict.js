import request from '@/utils/request';

/**
 * 根据key获取字典数据
 * @param {String} key 字典代码
 * @returns key对应字典的字典项
 */
export function getDictData(key) {
    return request({
        url: `/dict/${key}.do`,
        method: 'get',
    });
};