import { Message } from '../../types/Status';
import Spinner from '../Spinner';
import './style.css';

interface LoadingProps {

  message: Message,
  network:any
}

const Loading = ({message,network}:LoadingProps) => (
  <div className='loading' >

    <div className='text'>
    <div className='spinner' />
    <p  style={{fontSize:"18px", color:'orange'}}>{message.header}</p>
    <div>
    { message.body!= undefined  &&  <p style={{fontSize:"14px"}} >{message.body}</p>}
    </div>
    { message.taskId!= undefined  &&  <p style={{fontSize:"12px"}}>TxHash:  <a style={{fontSize:"12px", color:'blue'}} target="_blank" href={`${network.config.blockExplorers.default.url}/tx/` + message.taskId}>{message.taskId?.substring(0, 10)}....</a> </p>}
    </div>
  </div>

);

export default Loading;