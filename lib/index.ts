(function() {
  // 计算容器距离页面左上角的X值
  function getElementPageX(Element: HTMLElement) {
    let ElementPageX = Element.offsetLeft;
    let parent = (Element.offsetParent as unknown) as HTMLElement;
    while (parent) {
      ElementPageX += parent.offsetLeft;
      parent = (parent.offsetParent as unknown) as HTMLElement;
    }
    return ElementPageX;
  }
  // 计算容器距离页面左上角的Y值
  function getElementPageY(Element: HTMLElement) {
    let ElementPageY = Element.offsetTop;
    let parent = (Element.offsetParent as unknown) as HTMLElement;
    while (parent) {
      ElementPageY += parent.offsetTop;
      parent = (parent.offsetParent as unknown) as HTMLElement;
    }
    return ElementPageY;
  }

  const INIT_CONTAINER = Symbol("INIT_CONTAINER");
  const CREATE_CANVAS = Symbol("CREATE_CANVAS");
  const GET_NODES = Symbol("GET_NODES");
  const GROUP_NODES = Symbol("GROUP_NODES");
  const GROUP_NODES_BY_CLASS = Symbol("GROUP_NODES_BY_CLASS");
  const GROUP_NODES_BY_GROUPID = Symbol("GROUP_NODES_BY_GROUPID");
  const FOREACH_NODE = Symbol("FOREACH_NODE");
  const CREATE_DOT = Symbol("CREATE_DOT");
  const GENERATE_DOT = Symbol("GENERATE_DOT");
  const ADD_EVENTS = Symbol("ADD_EVENTS");
  const CLICK_EVENT = Symbol("CLICK_EVENT");
  const MOUSEDOWN_EVENT = Symbol("MOUSEDOWN_EVENT");
  const MOUSEUP_EVENT = Symbol("MOUSEUP_EVENT");
  const MOUSEMOVE_EVENT = Symbol("MOUSEMOVE_EVENT");
  const MOUSEDOWN = Symbol("MouseDown");
  const DRAW_LINE = Symbol("DRAW_LINE");

  class DomNodeConnection {
    private container: HTMLElement | null = null;
    private containerOffsetX: number = 0;
    private containerOffsetY: number = 0;
    private nodes: NodeListOf<HTMLElement> | null = null;
    private options: OptionsType;
    private startNode: HTMLElement | null = null;
    private endNode: HTMLElement | null = null;
    private canvasContext: CanvasRenderingContext2D | null = null;
    private [MOUSEDOWN]: boolean = false;

    constructor(options?: OptionsType) {
      this.options = Object.assign(defaultValue, options);
      this.init();
      let startNode:HTMLElement | null = null
      Object.defineProperties(this,{
        startNode:{
          get () {
            console.log('get',startNode)
            return startNode
          },
          set (v) {
            console.log('set',v)
            startNode = v
          }
        }
      })
    }


    private init() {
      this[INIT_CONTAINER](); // 指定容器
      this[GET_NODES](); // 获取节点
      if (this.nodes) {
        if (this.options.groupID !== false) {
          this[GROUP_NODES]();
        }
        this[FOREACH_NODE]();
        this[CREATE_CANVAS]();
        this[ADD_EVENTS]();
      }
    }

    // 指定容器
    private [INIT_CONTAINER]() {
      if (typeof this.options.container === "string") {
        this.container = document.getElementById(this.options.container);
      } else {
        this.container = this.options.container;
      }
      if (!this.container) {
        throw new Error(
          '缺少必要的容器:默认为 id="mk-wrap" 的元素,也可以传入指定HTMLElement。通过container指定容器 string | HTMLElement'
        );
      }
      this.container.style.position = "relative";
      this.containerOffsetX = getElementPageX(this.container);
      this.containerOffsetY = getElementPageY(this.container);
    }

    // 创建画布
    [CREATE_CANVAS]() {
      if (this.container) {
        let containerWidth = this.container.clientWidth;
        let containerHeight = this.container.clientHeight;
        let canvas = document.createElement("canvas");
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        canvas.style.position = "absolute";
        canvas.style.background = "transparent";
        canvas.style.zIndex = "-1";
        canvas.style.left = "0";
        canvas.style.right = "0";
        canvas.style.top = "0";
        canvas.style.bottom = "0";
        this.canvasContext = canvas.getContext("2d");
        this.container.insertBefore(canvas, this.container.firstChild);
        // this.container.appendChild(canvas);
      }
    }

    // 获取节点
    private [GET_NODES]() {
      let { nodeClass } = this.options;
      if (nodeClass) {
        this.nodes = document.querySelectorAll(`[class*="${nodeClass}"]`);
        // console.log(this.nodes);
      }
    }

    // 节点分组
    private [GROUP_NODES]() {
      this.options.groupID === ""
        ? this[GROUP_NODES_BY_CLASS]()
        : this[GROUP_NODES_BY_GROUPID]();
    }

    // 处理节点
    private [FOREACH_NODE]() {
      if (this.nodes) {
        const nodes = Array.prototype.slice.call(this.nodes);
        for (let node of nodes) {
          // 1.生成连线节点
          // this[GENERATE_DOT](node);
          // 2.给节点添加点击事件
          this[CLICK_EVENT](node)
        }
      }
    }

    // 生成连线节点
    [GENERATE_DOT](node: HTMLElement) {
      node.style.position = "relative";
      let fragment = this[CREATE_DOT]();
      node.appendChild(fragment);
    }
    // 创建连线节点元素
    [CREATE_DOT]() {
      let fragment = document.createDocumentFragment();
      let abs = [
        { left: "0", top: "0", transform: "translate(-50%,-50%)" },
        { left: "0", top: "50%", transform: "translate(-50%,-50%)" },
        { left: "0", bottom: "0", transform: "translate(-50%,50%)" },
        { left: "50%", bottom: "0", transform: "translate(-50%,50%)" },
        { right: "0", bottom: "0", transform: "translate(50%,50%)" },
        { right: "0", bottom: "50%", transform: "translate(50%,50%)" },
        { right: "0", top: "0", transform: "translate(50%,-50%)" },
        { left: "50%", top: "0", transform: "translate(-50%,-50%)" },
        { left: "50%", top: "50%", transform: "translate(-50%,-50%)" }
      ];
      let { dot, dotClass } = this.options;
      dot.forEach(e => {
        let span = document.createElement("span");
        span.className = "mk-span-dot";
        if (dotClass) {
          span.className = "mk-span-dot " + dotClass;
        }
        Object.entries(abs[e - 1]).forEach(([k, v]) => {
          span.style[(k as unknown) as number] = v || "";
        });
        fragment.appendChild(span);
      });
      return fragment;
    }

    // 给容器添加事件
    [ADD_EVENTS]() {
      if (this.options.mode === "click") {
        // this[CLICK_EVENT]();
      }
    }

    // 节点点击事件
    [CLICK_EVENT](node:HTMLElement) {
      let _this = this
      node.addEventListener("click", function(){
        if (!_this.startNode) {
          _this.startNode = this;
        } else {
          _this.endNode = this;
          _this[DRAW_LINE]()
        }
      });
      // if (this.container) {
      //   this.container.addEventListener("click", ({ pageX, pageY, target }) => {
      //     let targetElement = (target as unknown) as HTMLElement;
      //     if (targetElement.className.indexOf(this.options.nodeClass) >= 0) {
      //       if (!this.startNode) {
      //         this.startNode = targetElement;
      //       } else {
      //         this.endNode = targetElement;
      //         this[DRAW_LINE]()
      //       }
      //     }
      //   });
      // }
    }

    // 绘制连接线
    [DRAW_LINE]() {
      if (this.canvasContext) {
        if (this.endNode && this.startNode) {
          let startPos = this.getNodeDot(
            {
              x: getElementPageX(this.endNode)+this.endNode.offsetWidth/2,
              y: getElementPageY(this.endNode)+this.endNode.offsetHeight/2
            },
            this.startNode
          );
          let endPos = this.getNodeDot(
            startPos,
            this.endNode
          );
          this.canvasContext.moveTo(startPos.x, startPos.y);
          this.canvasContext.lineTo(endPos.x, endPos.y);
          this.canvasContext.stroke()
          this.startNode = null
          this.endNode = null
        }
      }
    }

    // 鼠标按下
    [MOUSEDOWN_EVENT]() {}

    // 鼠标松开
    [MOUSEUP_EVENT]() {}

    // 鼠标移动
    [MOUSEMOVE_EVENT]() {}

    // 通过class分组
    private [GROUP_NODES_BY_CLASS]() {}

    //  通过指定的自定义属性 groupID 分组
    private [GROUP_NODES_BY_GROUPID]() {}

    // 根据一点坐标，获取节点元素中的连线点
    private getNodeDot(mousePos: pos, node: HTMLElement) {
      // 获取节点宽度/高度
      const nodeWidth = node.offsetWidth;
      const nodeHeight = node.offsetHeight;
      // 计算容器距离页面左上角的X值
      let nodeX = getElementPageX(node);
      // 计算容器距离页面左上角的Y值
      let nodeY = getElementPageY(node);
      let dots = {
        1: {
          x: nodeX - this.containerOffsetX,
          y: nodeY - this.containerOffsetY
        },
        2: {
          x: nodeX - this.containerOffsetX,
          y: nodeY - this.containerOffsetY + nodeHeight / 2
        },
        3: {
          x: nodeX - this.containerOffsetX,
          y: nodeY - this.containerOffsetY + nodeHeight
        },
        4: {
          x: nodeX - this.containerOffsetX + nodeWidth / 2,
          y: nodeY - this.containerOffsetY + nodeHeight
        },
        5: {
          x: nodeX - this.containerOffsetX + nodeWidth,
          y: nodeY - this.containerOffsetY + nodeHeight
        },
        6: {
          x: nodeX - this.containerOffsetX + nodeWidth,
          y: nodeY - this.containerOffsetY + nodeHeight / 2
        },
        7: {
          x: nodeX - this.containerOffsetX + nodeWidth,
          y: nodeY - this.containerOffsetY
        },
        8: {
          x: nodeX - this.containerOffsetX + nodeWidth / 2,
          y: nodeY - this.containerOffsetY
        },
        9: {
          x: nodeX - this.containerOffsetX + nodeWidth / 2,
          y: nodeY - this.containerOffsetY + nodeHeight / 2
        }
      };
      let dotPos = this.PosSum(dots[9],9);
      const isCenter =
        Math.abs(mousePos.x - dotPos.x) <= nodeWidth / 4 &&
        Math.abs(mousePos.y - dotPos.y) <= nodeHeight / 4;
      const isRight =
        !isCenter &&
        mousePos.x > dotPos.x &&
        Math.abs(mousePos.y - dotPos.y) <= nodeHeight / 4;
      const isLeft =
        !isCenter &&
        mousePos.x < dotPos.x &&
        Math.abs(mousePos.y - dotPos.y) <= nodeHeight / 4;
      const isTop =
        !isCenter &&
        mousePos.y > dotPos.y &&
        Math.abs(mousePos.x - dotPos.x) <= nodeWidth / 4;
      const isBottom =
        !isCenter &&
        mousePos.y < dotPos.y &&
        Math.abs(mousePos.x - dotPos.x) <= nodeWidth / 4;
      const isRightTop =
        !isRight && mousePos.x > dotPos.x && mousePos.y < dotPos.y;
      const isRightBottom =
        !isRight && mousePos.x > dotPos.x && mousePos.y > dotPos.y;
      const isLeftTop =
        !isLeft && mousePos.x < dotPos.x && mousePos.y < dotPos.y;
      const isLeftBottom =
        !isLeft && mousePos.x < dotPos.x && mousePos.y > dotPos.y;
        // console.log({
        //   isCenter,isRight,isLeft,isTop,isBottom,isRightTop,isRightBottom,isLeftTop,isLeftBottom
        // })
      // switch (true) {
      //   case isCenter: // 在中心点
      //     break;
      //   case isLeftTop:
      //     dotPos = this.PosSum(dots[1],1);
      //     break;
      //   case isLeft:
      //     dotPos = this.PosSum(dots[2],2);
      //     break;
      //   case isLeftBottom:
      //     dotPos = this.PosSum(dots[3],3);
      //     break;
      //     case isBottom:
      //     dotPos = this.PosSum(dots[4],4);
      //     break;
      //   case isRightBottom:
      //     dotPos = this.PosSum(dots[5],5);
      //     break;
      //   case isRight:
      //     dotPos = this.PosSum(dots[6],6);
      //     break;
      //   case isRightTop:
      //     dotPos = this.PosSum(dots[7],7);
      //     break;
      //   case isTop:
      //     dotPos = this.PosSum(dots[8],8);
      //     break;
      //   default:
      //     dotPos = this.PosSum(dots[9],9);
      //     break;
      // }
      switch (true) {
        case isCenter: // 在中心点
          break;
        case isLeftTop:
          dotPos = this.PosSum(dots[2],2);
          break;
        case isLeft:
          dotPos = this.PosSum(dots[2],2);
          break;
        case isLeftBottom:
          dotPos = this.PosSum(dots[2],2);
          break;
          case isBottom:
          dotPos = this.PosSum(dots[4],4);
          break;
        case isRightBottom:
          dotPos = this.PosSum(dots[6],6);
          break;
        case isRight:
          dotPos = this.PosSum(dots[6],6);
          break;
        case isRightTop:
          dotPos = this.PosSum(dots[6],6);
          break;
        case isTop:
          dotPos = this.PosSum(dots[8],8);
          break;
        default:
          dotPos = this.PosSum(dots[9],9);
          break;
      }
      return dotPos;
    }

    // 对象的属性相加
    private PosSum(pos:pos,index:number):pos{
      let {x:x1,y:y1} = pos
      let x2 = 0
      let y2 = 0
      if(index in this.options.dotOffset){
        x2 = this.options.dotOffset[index].x
        y2 = this.options.dotOffset[index].y
      }else{
        x2 = this.options.dotOffset.x
        y2 = this.options.dotOffset.y
      }
      return {
        x:x1+x2,
        y:y1+y2
      }
    }
  }

  const defaultValue: OptionsType = {
    container: "mk-wrap",
    nodeClass: "mk-group",
    groupID: "", // 节点分组groupID ，默认是class分组
    dataKey: "", // 节点关联数据的key
    dot: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    dotOffset: { x: 0, y: 0 } ,
    mode: "click"
  };

  interface OptionsType {
    container: HTMLElement | string; // 容器
    nodeClass: string; // 作为节点的class前缀
    groupID: false | string;
    dataKey: string | number;
    dot: Array<D>;
    dotOffset: offsetType;
    dotClass?: string;
    mode: "click" | "move";
  }

  type D = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  type offsetType = {
    x: number;
    y: number;
    [ propName:number ]: offsetType
  };

  type pos = {
    x: number;
    y: number;
  };
  let a = new DomNodeConnection();
  console.log(a);
})();
