# 开发文档

## 一 文件目录
 
 ### 1.1 目录结构
广发拓扑图(以下简称成：拓扑图)项目位于广发前端项目根目录下的 /src/views 内的 link 文件夹中。
link文件夹内的文件即为“拓扑图项目”的代码文件，其文件结构如下：
![](./img/menus.png)
 * `nodes`  ： 拓扑图的节点文件目录文件夹
    * `anchor.js` ： 拓扑图的锚点组件文件 （锚点负责连接线段，一般位于节点的边框上）
    * `annotation.js` ：拓扑图的详细信息显示框组件 （鼠标放在节点上时浮现出的带有详细信息的卡片） 
    * `edge.js`： 拓扑图的连接线组件 （线组件负责连接开始锚点与结束锚点，依据线段的几何类型绘制出线段）
    * `step.js` 拓扑图的基本节点组件 （最主要的基本信息节点组件，用来展示一个动态独立的数据组）
 * `flow.js` 拓扑图的uaeengine初始化与事件交互组件（负责拓扑图的初始化，并对canvas进行事件的监听，拓扑图的鼠标事件，例如单击，双击等的触发事件均在此文件夹内）
 * `flowComponent.js` 拓扑图的节点文件总管理文件，nodes内的节点文件均被此文件动态统一注册，并且其中利用了uaeenigne的mixin函数统一为所有组件注册了一些公用的数据项与函数项
 * `index.vue` 拓扑图直接依赖的vue文件，其中有拓扑图运行时所在的canvas元素
 * `util.js` 一些辅助类函数，主要负责将输入拓扑图的数据转化成拓扑图可以解析的数据，现在已经被迁移到广发前端总项目的pipe文件夹内（已废弃，详细查看pipe文件夹内的文件）


## 二 数据结构介绍

### 2.1 拓扑图运行时所需的数据结构
拓扑图的内容涉及到运行时数据结构的主要有基本信息节点组件与线组件两个基本的组件，其在JavaScript的存储的数据结构如下：
```javascript
const topoData = {
    nodes:[node1,node2,..],
    edges:[edge1,edge2,...]
}
```
该数据项为一个JavaScript对象，`nodes`项表示基本节点，`edges`表示线段节点。
该数据会被`uaeengine`解析成在canvas上具体的组件实例，其逻辑代码在flow.js上：
![](./img/template.png)
其中 `flowContent` 为拓扑图运行时的所需数据
### 2.2 节点数据结构
上述描述的拓扑图运行时所需的数据结构中的`nodes`是拓扑图中的基本信息节点数据结构。

拓扑图中的节点具有父子级关系的特点，因此他们的数据结构中具有`parent`，`children`项。

拓扑图中的节点具有等级特点，通常有一个根级节点往下展开（层级不断递增）,因此他们的数据结构中具有`level`项。
```javascript
   const node = {
       id:'nodeId2',
       parent : 'nodeId5',
       children : ['nodeId72','nodeId42','nodeId22'],
       level:3,
   }
```
其中`parent`和`children`项中的数据由节点的id项进行表示。

### 2.3 关于节点的展开与收缩事件的处理逻辑说明
在拓扑图业务需求中，若点击父级节点，其对于子节点会有相应的展开与收缩的功能，在目前的代码中的处理逻辑涉及到了此节讨论的`parent`与`children`项。下图为代码内（`flow.js`）具体的处理逻辑
![](./img/expand.png)
如上图代码所示，代码通过遍历其后代节点，并依据相应业务逻辑对他们对`isCollapse`属性进行赋值处理。其后代节点便可以在其绘制函数（可查看后面一节的UI改造模块）中依据`isCollapse`进行动态展示。如下图所示：
 ![](./img/collapse.png)
  
### 2.4 连线数据结构

上述描述的拓扑图运行时所需的数据结构中的`edges`是拓扑图中线段节点数据结构。

线段节点主要包含了起始点位置，终止点位置两个信息，在拓扑图项目中用基本信息节点的id进行表示。其结构如下：
```javascript
   const edge = {
       sNode:'nodeId2',
       eNode:'nodeId5',
   }
```
拓扑图中的线端都是用来连接父子关系的节点的，因此上述`edge`例子的`sNode`（nodeId2）为`eNode`（nodeId5）的父级节点。
 

## 三 开发说明

### 3.1 UI改造
`canvas`内的图形均由一个个的`组件节点`实例绘制而从，通过修改`组件节点`的绘制函数以改变其节点的显示样式。
节点的绘制函数位于节点文件内的节点对象的draw函数内。
![](./img/editUi.png)
例如锚点（`anchor.js`)节点的样式可以通过上图中的红色矩形框内的draw函数内的代码更改。
`this.$ctx`是`uaeengine`依赖的`canvas`元素上的`2DContenxt`，通过利用网页`canvas`的API对需要的组件节点进行样式更改。
例如通过将`edge.js`的data数据项中的`bgColor`从`“#FFFFFF”`修改成`“#000000”`便可以将锚点的背景颜色从白色变成黑色。基本的canvas使用文档可参考[MDN的canvas模块](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)

### 3.2 节点和线的选中
在具有事件交互的拓扑图需求中，需要确定某个组件是否被选中，通常我们需要判断鼠标是否在一个组件的尺寸范围内。
节点的选中逻辑位于节点文件内的节点对象的`isHere`函数内。
其中函数`输入参数`有鼠标的位置横坐标（X），与纵坐标（Y），`输出参数`为false/true（表示组件是否被鼠标选中）
![](./img/here.png)
例如线段(`edge.js`)节点的选中逻辑可以通过上图中的红色矩形框内的`isHere`函数内的代码更改。此外，`uaeengine`内置了部分辅助函数可以用来检查简单的图形选中逻辑。

### 3.3 事件监听
在拓扑图中的事件监听事件均位于`flow.js`文件中，包括`mousedown`，`dbclick`，`drag`等。
若要给某一类组件添加事件，需要通过事件参数总的信息进行分类处理，事件监听的回调函数会带有被选中组件(通过上节-组件的选中模块可以进行改变)的数据。
![](./img/event.png)
例如上图中的右键事件的处理函数，对被选中对组件（`e.comp`）进行了具体对逻辑处理

 ### 3.4 组件根据事件响应渲染
 在事件监听的回调函数中我们只能更改对于选中组件的数据项，若要在canvas反应出对于事件触发的变化，我们需要在组件的draw函数（上节-UI改造模块）中对组件的props中的数据进行动态的渲染。例如我们通过拖动改变位置数据(在flow.js中监听该事件)，并在对应的组件内动态的对位置数据进行渲染(在step.js的draw使用位置变量),如下图所示：
![](./img/flow.png)
在flow.js内监听drag事件，并在回调函数中更改位置数据
![](./img/step.png)
在step.js组件内的draw函数内动态的依据位置数据进行canvas的渲染，以完成拖动的效果