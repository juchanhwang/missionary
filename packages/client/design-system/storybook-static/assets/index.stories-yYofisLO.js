import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{a as t}from"./utils-CkYB-R1u.js";function S({label:q,href:l,onClick:d,isActive:c,isExpanded:N,hasChildren:H,depth:R=0,className:B,style:m}){const _=R===0,F="flex items-center justify-between w-full transition-colors duration-200 cursor-pointer text-left font-medium text-[15px] leading-[22px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",O=t("h-11 px-5 text-white/80 hover:text-white hover:bg-white/8 rounded-md mx-2",{"bg-white/10 text-white":c}),V=t("h-10 px-5 pl-9 text-white/60 hover:text-white/90 hover:bg-white/5 rounded-md mx-2",{"bg-white/8 text-white/90":c}),p=t(F,_?O:V,B),u=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"flex-1 truncate",children:q}),H&&e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:t("transition-transform duration-200",{"rotate-180":N}),children:e.jsx("path",{d:"M5 7.5L10 12.5L15 7.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]});return l?e.jsx("a",{href:l,className:p,style:m,onClick:d,children:u}):e.jsx("button",{type:"button",onClick:d,className:p,style:m,children:u})}S.__docgenInfo={description:"",methods:[],displayName:"NavItem",props:{label:{required:!0,tsType:{name:"string"},description:""},href:{required:!1,tsType:{name:"string"},description:""},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:`(
  e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
) => void`,signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>",elements:[{name:"union",raw:"HTMLAnchorElement | HTMLButtonElement",elements:[{name:"HTMLAnchorElement"},{name:"HTMLButtonElement"}]}]},name:"e"}],return:{name:"void"}}},description:""},isActive:{required:!1,tsType:{name:"boolean"},description:""},isExpanded:{required:!1,tsType:{name:"boolean"},description:""},hasChildren:{required:!1,tsType:{name:"boolean"},description:""},depth:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""},style:{required:!1,tsType:{name:"ReactCSSProperties",raw:"React.CSSProperties"},description:""}}};const D={title:"Components/NavItem",component:S,parameters:{backgrounds:{default:"dark",values:[{name:"dark",value:"#111111"},{name:"light",value:"#ffffff"}]}},argTypes:{onClick:{action:"clicked"}}},r={args:{label:"Parent Item",hasChildren:!0,isExpanded:!1,depth:0}},n={args:{label:"Parent Item",hasChildren:!0,isExpanded:!0,depth:0}},s={args:{label:"Parent Item",hasChildren:!0,isExpanded:!0,isActive:!0,depth:0}},a={args:{label:"Child Item",hasChildren:!1,depth:1}},i={args:{label:"Child Item",hasChildren:!1,isActive:!0,depth:1}},o={args:{label:"Link Item",href:"#",depth:0}};var h,f,g;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Parent Item',
    hasChildren: true,
    isExpanded: false,
    depth: 0
  }
}`,...(g=(f=r.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var x,v,b;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: 'Parent Item',
    hasChildren: true,
    isExpanded: true,
    depth: 0
  }
}`,...(b=(v=n.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};var C,w,E;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Parent Item',
    hasChildren: true,
    isExpanded: true,
    isActive: true,
    depth: 0
  }
}`,...(E=(w=s.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var I,T,L;a.parameters={...a.parameters,docs:{...(I=a.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Child Item',
    hasChildren: false,
    depth: 1
  }
}`,...(L=(T=a.parameters)==null?void 0:T.docs)==null?void 0:L.source}}};var y,P,k;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: 'Child Item',
    hasChildren: false,
    isActive: true,
    depth: 1
  }
}`,...(k=(P=i.parameters)==null?void 0:P.docs)==null?void 0:k.source}}};var A,M,j;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'Link Item',
    href: '#',
    depth: 0
  }
}`,...(j=(M=o.parameters)==null?void 0:M.docs)==null?void 0:j.source}}};const G=["ParentCollapsed","ParentExpanded","ParentActive","Child","ChildActive","LinkItem"];export{a as Child,i as ChildActive,o as LinkItem,s as ParentActive,r as ParentCollapsed,n as ParentExpanded,G as __namedExportsOrder,D as default};
