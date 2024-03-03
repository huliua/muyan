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

/**
 * 构建树形路由地址的path路径（将父节点的path+子节点的path拼接在一起）
 * @param {Array} tree 树形结构
 */
export function buildTreeRouterPath(tree, prePath = '') {
  return tree.forEach(item => {
    const path = item.path;
    if (item.children && item.children.length > 0) {
      buildTreeRouterPath(item.children, prePath + '/' + path);
    } else if (item.isLink != '1') {
      item.path = prePath + '/' + path;
    }
  });
}
