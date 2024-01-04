import { isBlank } from '@/utils/commonUtils';
export function buildTreeData(data, props) {
  if (isBlank(props)) {
    props = {
      idProp: 'id',
      parentIdProp: 'parentId',
      childrenProp: 'children'
    };
  }
  // 处理树形结构
  const tree = [];
  const map = {};
  data.forEach(item => {
    map[item[props.idProp || 'id']] = item;
  });
  data.forEach(item => {
    const parent = map[item[props.parentIdProp || 'parentId']];
    if (parent) {
      (parent[props.childrenProp || 'children'] || (parent[props.childrenProp || 'children'] = [])).push(item);
    } else {
      tree.push(item);
    }
  });
  return tree;
}
