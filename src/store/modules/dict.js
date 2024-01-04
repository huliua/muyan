import { defineStore } from 'pinia';
import { getDictData } from '../../api/dict';
const useDictStore = defineStore('dict', {
  state: () => ({
    dictData: {}
  }),
  actions: {
    initDict(...names) {
      names.forEach(key => {
        if (this.dictData.hasOwnProperty(key)) {
          // 字典数据已存在，不用初始化
          return;
        }
        // 初始化字典数据
        getDictData(key).then(res => {
          this.dictData[key] = (res.data || []).map(item => {
            return { label: item.mc, value: item.dm, tagType: item.tagType || '' };
          });
        });
      });
    },

    getDict(key) {
      return this.dictData[key] || [];
    }
  }
});

export default useDictStore;
