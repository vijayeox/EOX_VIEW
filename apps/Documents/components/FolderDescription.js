import { Antd, AntdIcons, React } from "oxziongui";
const {Drawer} = Antd
class FolderDescription extends React.Component{
    constructor(props){
        super(props)
        this.state={
            showDrawer:false
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(prevProps.isShow != this.props.isShow){
            this.setState({showDrawer:this.props.isShow})
        }
    }
    render(){
        const {showDrawer} = this.state;
        const {entityName,description} = this.props;
        return(
            <Drawer
                title={entityName}
                width={1080}
                closable={true}
                onClose={this.props.onClose}
                style={{ position: 'absolute' }}
                getContainer={false}
                visible={showDrawer}
            >
                <p dangerouslySetInnerHTML={{__html: description}}></p>
            </Drawer>
        )
    }
}

export default FolderDescription;