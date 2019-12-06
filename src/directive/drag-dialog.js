export default{
  bind(el, binding, vnode) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    dialogHeaderEl.style.cssText += ';cursor:move;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;';
    dragDom.style.cssText += ';top:0px;';

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const getStyle = (() => {
      if (window.document.currentStyle) return (dom, attr) => dom.currentStyle[attr];
      return (dom, attr) => getComputedStyle(dom, false)[attr];
    })();

    dialogHeaderEl.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      const dragDomWidth = dragDom.offsetWidth;
      const dragDomHeight = dragDom.offsetHeight;

      const screenWidth = document.body.clientWidth;
      const screenHeight = document.body.clientHeight;

      const minDragDomLeft = dragDom.offsetLeft;
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;

      const minDragDomTop = dragDom.offsetTop;
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight;

      // 获取到的值带px 正则匹配替换
      let styL = getStyle(dragDom, 'left');
      let styT = getStyle(dragDom, 'top');

      if (styL.includes('%')) {
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100); // eslint-disable-line
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100); // eslint-disable-line
      } else {
        styL = +styL.replace(/\px/g, '');
        styT = +styT.replace(/\px/g, '');
      }
      console.log(styL, styT);

      document.onmousemove = (de) => {
        // 通过事件委托，计算移动的距离
        let left = de.clientX - disX;
        let top = de.clientY - disY;

        // 边界处理
        if (-(left) > minDragDomLeft) {
          left = -minDragDomLeft;
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft;
        }

        if (-(top) > minDragDomTop) {
          top = -minDragDomTop;
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop;
        }
        console.log(left, top);
        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`;

        // emit onDrag event
        vnode.child.$emit('dragDialog');
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
};
