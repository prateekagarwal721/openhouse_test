import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      is_joined:false,
      count:0,
      video_rcv: 0,
      video_send:0
    }
  }

  showEvent(e) {
    console.log('callFrame event', e) 
  }

  checkStatus(callFrame){
    this.updateNetworkInfoDisplay(callFrame)
  }

  onJoinMeeting(callFrame){
    setInterval(()=>this.checkStatus(callFrame),10*1000);
  }

  async createFrame() {
    var callFrame = window.DailyIframe.createFrame({
      showLeaveButton: true,
      iframeStyle: {
        position: 'fixed',
        top: '100px',
        left: '100px',
        width: '50%',
        height: '500px'
      }
    }
    );
    console.log('createFrame')
    console.log(callFrame)
    this.setState({is_joined:true})
    callFrame.join({ url: 'https://agarwal-test.daily.co/hello' })
    callFrame.on('loaded', ()=>this.showEvent())
              .on('joining-meeting',()=>{this.onJoinMeeting(callFrame)})
  }



  async updateNetworkInfoDisplay(callFrame) {
    var statsInfo = await callFrame.getNetworkStats();
    var count = 0
      for (let key in callFrame.participants()){
        count = count + 1
        if(!callFrame.participants()[key].owner){
          if(statsInfo.quality < 95 && statsInfo.quality > 90){
            callFrame.setBandwidth({
              kbs: 100,
              trackConstraints: { width: 128, height: 128, frameRate: 10 }
            });
            
          }
          else if(statsInfo.quality < 90 && statsInfo.quality > 80){
            callFrame.setBandwidth({
              kbs: 50,
              trackConstraints: { width: 128, height: 128, frameRate: 10 }
            });
          }
          else if(statsInfo.quality < 80 && statsInfo.quality > 70){
            callFrame.setBandwidth({
              kbs: 50,
              trackConstraints: { width: 64, height: 64, frameRate: 5 }
            });
            callFrame.updateParticipant(callFrame.participants()[key].session_id,{setVideo:false})
          }
          else if(statsInfo.quality < 70){
            callFrame.setBandwidth({
              kbs: 32,
              trackConstraints: { width: 64, height: 64, frameRate: 3 }
            });
            callFrame.updateParticipant(callFrame.participants()[key].session_id,{setVideo:false,setAudio:false})
          }
          else{
            callFrame.updateParticipant(callFrame.participants()[key].session_id,{setVideo:true,setAudio:true})
          }
        }
      }
    var video_send = Math.floor(statsInfo.stats.latest.videoSendBitsPerSecond/1000)
    var video_rcv = Math.floor(statsInfo.stats.latest.videoRecvBitsPerSecond/1000)
    this.setState({count:count, video_send:video_send,video_rcv:video_rcv})
  }


  render(){
    return(
    <div className="App">
      {!this.state.is_joined ?
      <div style={{display:'flex',justifyContent:'center'}}>
        <div style={{display:'flex',justifyContent:'center',border: '2px solid #14057c',width:'50%',height:'400px',marginTop:'100px'}}>
          <button style={{width:'100px',height:'30px',marginTop:'25%',border: '2px solid',backgroundColor: '#36f',color: '#fff',borderRadius: '5px',fontSize: '18px'}} onClick={()=>this.createFrame()}>Join</button>
      </div>
      </div>
      :
      <div style={{marginTop:'100px',marginLeft:'40%'}}>
        <div>Participants: {this.state.count}</div>
        <div>Downloading: {this.state.video_rcv} kb/s</div>
        <div>Uploading: {this.state.video_send} kb/s</div>
      </div>
      }
    </div>
    )
    }
}

export default App;
