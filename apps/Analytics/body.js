
import $ from 'jquery';
import { React, Query, DataSource, Visualization, TemplateManager } from 'oxziongui';
import { WidgetManager, DashboardManager } from 'oxziongui';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import "@trendmicro/react-sidenav/dist/react-sidenav.css";

const SECTION_DATA_SOURCE = 'DS'; //DataSource
const SECTION_QUERY = 'QR'; //QueRy
const SECTION_DASHBOARD = 'DB'; //DashBoard
const SECTION_EDIT_DASHBOARD = 'EDB'; //Edit DashBoard
const SECTION_WIDGET = 'WD'; //Edit DashBoard
const SECTION_VISULAIZATION = 'VS' //Visualization
const SECTION_TEMPLATEMANGER = 'TM' //TemplateManager

class Body extends React.Component {
	constructor(props) {
		super(props);
		this.core = this.props.args;
		this.appId = this.props.appId;
		this.params = this.props.params;
		this.proc = this.props.proc;
		this.config = this.props.config;
		this.keepExpanded = this.props.keepExpanded;
		// this.navigation = React.createRef();
		this.appNavigationDiv = "navigation_" + this.appId;
		this.state = {
			menus: this.props.menus ? this.props.menus : [],
			selected: "",
			expanded: this.keepExpanded ? true : false,
		};
		this.onSelect = this.onSelect.bind(this);
		this.onToggle = this.onToggle.bind(this);
		this.state = {
			isMenuOpen: false,
			displaySection: SECTION_DASHBOARD,
			sectionData: null,
			title: ''
		};
	}

	onToggle(expanded) {
		this.setState({ expanded: expanded });
	}

	onSelect(selected) {
		this.setState({
			displaySection: selected,
			expanded: this.keepExpanded ? true : false,
		});
	}
	menuLoad(menus) {
		this.setState({
			menus: menus,
		});
	}
	selectLoad(selected) {
		this.setState({
			selected: selected,
		});
	}

	hideMenu = () => {
		this.setState({ isMenuOpen: false });
	};

	showMenu = () => {
		this.setState({ isMenuOpen: true });
	};

	switchSection = (section, data) => {
		this.hideMenu();
		this.setState({
			displaySection: section,
			sectionData: data
		});
	}

	editDashboard = (data) => {
		this.switchSection(SECTION_EDIT_DASHBOARD, data);
	}

	handleMenuStateChange = (state) => {
		this.setState({ isMenuOpen: state.isOpen });
		this.showHideMenuElement(state.isOpen);
	}

	//Hack to prevent menu element from showing up when it slides off to left.
	showHideMenuElement = (isOpen) => {
		var menuElement = $('.page-body .bm-menu-wrap');
		if (isOpen) {
			menuElement.show();
		} else {
			menuElement.hide();
		}
	}

	setTitle = (title) => {
		this.setState({ title: title });
	}

	componentDidMount() {
		this.showHideMenuElement(false);
	}

	render() {
		// const { expanded, selected } = this.state;
		let sectionContent;
		switch (this.state.displaySection) {
			case SECTION_DATA_SOURCE:
				sectionContent = <DataSource args={this.core} setTitle={this.setTitle} />;
				break;
			case SECTION_QUERY:
				sectionContent = <Query args={this.core} setTitle={this.setTitle} />;
				break;
			case SECTION_DASHBOARD:
				sectionContent = <DashboardManager args={this.core} proc={this.props.proc} setTitle={this.setTitle} editDashboard={this.editDashboard} hideEdit={false} key={""} />;
				break;
			case SECTION_WIDGET:
				sectionContent = <WidgetManager args={this.core} setTitle={this.setTitle} editDashboard={this.editDashboard} />;
				break;
			case SECTION_VISULAIZATION:
				sectionContent = <Visualization args={this.core} setTitle={this.setTitle} />;
				break;
			case SECTION_TEMPLATEMANGER:
				sectionContent = <TemplateManager args={this.core} setTitle={this.setTitle} />;
				break;
		}
		console.log(sectionContent);
		return (
			<div id="page-body" className={"page-body full-width LeftMenuTemplate" + (this.props.proc.metadata.hideMenu ? " hideMenu" : "")}>
				<SideNav
					onSelect={this.onSelect}
				>
					<SideNav.Toggle />
					<SideNav.Nav defaultSelected={SECTION_DASHBOARD}>
						<NavItem eventKey={SECTION_DATA_SOURCE} key={SECTION_DATA_SOURCE}>
							<NavIcon>
								<i className="fad fa-database" aria-hidden="true"></i>
							</NavIcon>
							<NavText>
								Data Source
							</NavText>
						</NavItem>
						<NavItem eventKey={SECTION_QUERY} key={SECTION_QUERY}>
							<NavIcon>
								<i className="fa fa-question" aria-hidden="true"></i>
							</NavIcon>
							<NavText>
								Query
							</NavText>
						</NavItem>
						<NavItem eventKey={SECTION_DASHBOARD} key={SECTION_DASHBOARD}>
							<NavIcon>
								<i className="fas fa-analytics" aria-hidden="true"></i>
							</NavIcon>
							<NavText>
								Operational Intelligence
							</NavText>
						</NavItem>
						<NavItem eventKey={SECTION_WIDGET} key={SECTION_WIDGET}>
							<NavIcon>
								<i className="fa fa-cubes" aria-hidden="true"></i>
							</NavIcon>
							<NavText>
								MLet Manager
							</NavText>
						</NavItem>
						<NavItem eventKey={SECTION_VISULAIZATION} key={SECTION_VISULAIZATION}>
							<NavIcon>
								<i className="fa fa-presentation" aria-hidden="true"></i>
							</NavIcon>
							<NavText>
								Vizualization
							</NavText>
						</NavItem>
						<NavItem eventKey={SECTION_TEMPLATEMANGER} key={SECTION_TEMPLATEMANGER}>
							<NavIcon>
								<i className="fas fa-code" aria-hidden="true"></i>
							</NavIcon>
							<NavText>
								Template Manager
							</NavText>
						</NavItem>
					</SideNav.Nav>
				</SideNav>
				<div className="page-content full-width" id="page-content">
					{
						this.state.title != "Operational Intelligence" && <div className="page-title">{this.state.title}</div>
					}
					<div className="page-content full-width" id="page-content">
						{sectionContent}
					</div>
				</div>
			</div>
		);
	}
}

export default Body;