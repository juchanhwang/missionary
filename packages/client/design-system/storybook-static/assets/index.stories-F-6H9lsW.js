import{j as X}from"./jsx-runtime-D_zvdyIk.js";import{a as T}from"./utils-CkYB-R1u.js";const L={sm:"h-8",md:"h-10",lg:"h-12",xlg:"h-[52px]",xxlg:"h-14 rounded-none"},O={primary:"bg-primary-50 text-white hover:bg-primary-60 active:bg-primary-70 disabled:bg-gray-30 disabled:text-gray-50 disabled:cursor-not-allowed",neutral:"bg-gray-80 text-white hover:bg-gray-70 active:bg-gray-90 disabled:bg-gray-30 disabled:text-gray-50 disabled:cursor-not-allowed"},q={primary:"border border-primary-50 bg-white text-primary-50 hover:bg-primary-10 active:bg-primary-20 disabled:border-gray-30 disabled:text-gray-40 disabled:cursor-not-allowed",neutral:"border border-gray-40 bg-white text-gray-80 hover:bg-gray-10 active:bg-gray-20 disabled:border-gray-30 disabled:text-gray-40 disabled:cursor-not-allowed"};function h({variant:f="filled",width:l,size:v="md",color:o="primary",children:w,className:C,style:B,...z}){const S=typeof l=="number"?{width:`${l}px`}:{width:l};return X.jsx("button",{className:T("text-base font-bold rounded-lg transition-colors",L[v],f==="filled"?O[o]:q[o],C),style:{...S,...B},...z,children:w})}h.__docgenInfo={description:"",methods:[],displayName:"Button",props:{variant:{required:!1,tsType:{name:"union",raw:"'filled' | 'outline'",elements:[{name:"literal",value:"'filled'"},{name:"literal",value:"'outline'"}]},description:"",defaultValue:{value:"'filled'",computed:!1}},width:{required:!1,tsType:{name:"ReactCSSProperties['width']",raw:"React.CSSProperties['width']"},description:""},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg' | 'xlg' | 'xxlg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xlg'"},{name:"literal",value:"'xxlg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},color:{required:!1,tsType:{name:"union",raw:"'primary' | 'neutral'",elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'neutral'"}]},description:"",defaultValue:{value:"'primary'",computed:!1}}},composes:["ButtonHTMLAttributes"]};const j={title:"Components/Button",component:h,argTypes:{variant:{control:{type:"select",options:["filled","outline"]}},size:{control:{type:"select",options:["sm","md","lg","xlg","xxlg"]}},color:{control:{type:"select",options:["primary","secondary"]}},width:{control:{type:"text"}}}},e={args:{variant:"filled",width:"100px",size:"md",color:"primary",children:"Filled Button"}},r={args:{variant:"outline",width:"100px",size:"md",color:"primary",children:"Outline Button"}},a={args:{variant:"filled",width:"200px",size:"xxlg",color:"primary",children:"XXLarge Button"}},t={args:{variant:"filled",width:"150px",size:"md",color:"primary",children:"Custom Color Button"}};var i,n,s;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    variant: 'filled',
    width: '100px',
    size: 'md',
    color: 'primary',
    children: 'Filled Button'
  }
}`,...(s=(n=e.parameters)==null?void 0:n.docs)==null?void 0:s.source}}};var d,m,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: 'outline',
    width: '100px',
    size: 'md',
    color: 'primary',
    children: 'Outline Button'
  }
}`,...(c=(m=r.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var u,p,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'filled',
    width: '200px',
    size: 'xxlg',
    color: 'primary',
    children: 'XXLarge Button'
  }
}`,...(g=(p=a.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var y,x,b;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: 'filled',
    width: '150px',
    size: 'md',
    color: 'primary',
    children: 'Custom Color Button'
  }
}`,...(b=(x=t.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};const R=["Filled","Outline","XXLarge","CustomColor"];export{t as CustomColor,e as Filled,r as Outline,a as XXLarge,R as __namedExportsOrder,j as default};
