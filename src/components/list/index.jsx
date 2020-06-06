import React, {Component} from 'react';
import PropTypes from "prop-types";
import axios from "axios";

let isSearching=false; //代表是否正在搜索
export default class List extends Component {
  	static propTypes = {
  	  searchName: PropTypes.string.isRequired
    };
  
    state = {
        isFirstView: true, //初始化显示
        isLoading: false, //是否加载中
        success: null,/*成功的数据 有值就是值的数据，没有就是null */
        error: null /* 失败的原因 */
    };
   
    // 发送请求，将来可能要发多次请求，因此不能在componentDidMount(整个生命周期只执行一次)中发请求
    // 要保证组件渲染完毕后再发请求,因为要在页面初始化渲染完后，点击search按钮才能发请求

  // 静态方法没有this
    static getDerivedStateFromProps(nextProps,privState){
      const {searchName}=nextProps;
      // 第一次渲染不能切换为loading,如果第一次更新状态为成功的状态,也不能切换为loading
      if(searchName&&!isSearching){
        isSearching=true;
          //  返回一个更新的状态
        return {
          isFirstView:false,isLoading:true
        };
      }else{
        // 返回空，代表不改变
        return null
      }
    };
    
    componentDidUpdate=(prevProps, prevState)=>{
      // 获取最新的props
      const {searchName}=this.props;
      // 保证不限于死循环,判断上一次的searchName和当前新的searchName是否相等
      if(searchName!==prevProps.searchName){
        // 发送ajax请求
        axios.get(`https://api.github.com/search/users?q=${searchName}`)
        .then((res) => {
          // console.log(res)
          // 更新状态 
          console.log(this)
          this.setState({
            isLoading: false,
            success: res.data.items.map((item) => {
              return {
                name: item.login,
                url: item.html_url,
                image: item.avatar_url
              }
            })
          },()=>{
            // 会在渲染完成后重新调用，用来获取更新后的状态值
            // 保证下一次用户search,能够切换为loading状态
            isSearching=false;
          })
        })
        .catch((err) => {
          // 更新状态
          this.setState({
            isLoading:false,
            error:err
          })
        },()=>{
          // 组件渲染完后才调用，不能再重新更新状态，所以定义成变量
          isSearching=false;
        });
      }
      
    }
    
	render(){
    const {isFirstView,isLoading,success,error}=this.state;
    if(isFirstView){
      return <h2>enter name to search</h2>
    }else if(isLoading){
      return <h2>Loading...</h2>
    }else if(success){
      return (
        <div className="row">
        {
          success.map((item,index)=>{
            return <div className="card" key={index}>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <img src={item.image} alt={""} style={{width:100}}/>
            </a>
            <p className="card-text">{item.name}</p>
          </div>
          })
        }
        </div>
      )
    }
    else{
     return <h2>{error.toString()}</h2>
    }
	}
}