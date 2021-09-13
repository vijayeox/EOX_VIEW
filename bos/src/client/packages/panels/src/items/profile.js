/*
* OS.js - JavaScript Cloud/Web Desktop Platform
*
* Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* 1. Redistributions of source code must retain the above copyright notice, this
*    list of conditions and the following disclaimer
* 2. Redistributions in binary form must reproduce the above copyright notice,
*    this list of conditions and the following disclaimer in the documentation
*    and/or other materials provided with the distribution
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
* ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
* ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*
	* @author  Anders Evenrud <andersevenrud@gmail.com>
	* @licence Simplified BSD License
	*/
	import {h} from 'hyperapp';
	import PanelItem from '../panel-item';
	import Swal from 'sweetalert2';
	import withReactContent from 'sweetalert2-react-content';
	const MySwal = withReactContent(Swal);
	const logoutIcon = require('../../../../assets/images/logout.png');
	const profileIcon = require('../../../../assets/images/profile.png');
	const settingsIcon = require('../../../../assets/images/settings.png');
	const editIcon = require('../../../../assets/images/edit.svg');
	
	// const profileIcon = require('../../../../assets/images/profile_pic.png');
	/**
	* Profile
	*
	* @desc Profile Panel Item
	*/
	export default class ProfilePanelItem extends PanelItem {
		init() {
			if (this.inited) {
				return;
			}
			super.init();
		}
		destroy() {
			this.interval = clearInterval(this.interval);
			super.destroy();
		}
		render(state, actions) {
			let profileDetails = this.core.make('oxzion/profile').get();
			profileDetails = profileDetails['key'];

			let profileAccounts = {};
			profileDetails.accounts.map((v) => {
			  profileAccounts[v.accountId] = v.name;
			});
			const switchaccountPopup = () => {
				MySwal.fire({
					title: 'Select an Account',
					position: "center",
					showCancelButton: true,
					cancelButtonColor: '#7b7878',
					target: ".osjs-root",
					input: 'select',
					inputOptions: profileAccounts,
					inputValue: profileDetails.accountId
				}).then((result) => {
					if (result.value && result.value != profileDetails.accountId) {
						switchaccount(result.value);
					}
				})
			}
			const switchaccount = async (accountId) => {
				let helper = this.core.make("oxzion/restClient");
				let response = await helper.request(
					"v1",
					"user/switchaccount",
					{ accountId: accountId },
					"post"
				);
				if (response.status == "success") {
					let user = this.core.getUser();
					user.jwt = response.data.jwt;
					this.core.setUser(user)
					// this.core.make("oxzion/restClient").handleRefresh();
					this.core.make("oxzion/profile").update();
					location.reload();
				} else {
					console.log(response.data.errors);
				}
			}
			const openProfile= () =>{
				this.core.run("Preferences");
			}
			return super.render('profile', [
				h('div', {
					className: 'osjs-panel-profile'
				}, [
					h('div', {
						className: 'profile-content'
					},[
						h('div', {
							className: 'myprofile'},[
								h('div', {
									className: 'profile-dropdown-div'
								}, [
									h('img', {
										src: profileDetails.icon + "?" + new Date(),
										alt: 'My Profile',
										className: 'profile-dropdown-image',
										title: 'My Profile'
									}),
									h('div', {
										className: 'profile-dropdown-block'
									},[
										h('div', {
											title: profileDetails.name,
											innerHTML : profileDetails.name,
											className: 'profile-dropdown-name'
										}),
										h('div', {
											title: profileDetails.designation?profileDetails.designation:'No designation provided',
											innerHTML : profileDetails.designation?profileDetails.designation:null,
											className: 'profile-dropdown-designation'
										}),
									])
								])
							]
							),
							(Object.keys(profileAccounts).length > 1) ?
							h('a', {
								className: 'profileitem'},[
									h('div', {
										onclick: switchaccountPopup,
										className: 'profile-dropdown-item'
									}, [
										h('img', {
											src: editIcon,
											alt: 'Switch Account',
											className: 'profile-dropdown-icon',
											title: 'Switch Account'
										}),
										h('span', {
											title: 'Switch Account',
											innerHTML : 'Switch Account',
											className: 'profile-dropdown-text'
										})
									]
									)
								]
								) : (null),
								h('a', {
									className: 'profileitem'},[
										h('div', {
											onclick: openProfile,
											className: 'profile-dropdown-item'
										}, [
											h('img', {
												src: editIcon,
												alt: 'Edit Profile',
												className: 'profile-dropdown-icon',
												title: 'Edit Profile'
											}),
											h('span', {
												title: 'Edit Profile',
												innerHTML : 'Edit Profile',
												className: 'profile-dropdown-text'
											})
										]
										)
									]
									),
								]),
								h('img', {
									className:'profileicon',
									src: profileDetails['icon'] + '?' + (new Date()).getTime(),
									alt: profileDetails['firstname'],
									title:'My Profile'
								})
							])
						]);
					}
				}