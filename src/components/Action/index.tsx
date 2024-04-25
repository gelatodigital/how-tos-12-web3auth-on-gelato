
import "./style.css";
import Button from "../Button";

interface InputProps {
  ready: boolean;
  onClick: (action: number) => void;
  onUpdate: (value: number, action: number) => void;
  text: string;
  max:boolean;
  action: number;
  amount: number;
}



const Action = ({
  ready,

  onClick,
  onUpdate,
  text,
  action,
  amount,
  max
}: InputProps) => {
 

  return (
    <div style={{ width: "300", padding: "10px" }}>
     
      <input
        id="prompt"
        className="input"
        placeholder="Input amount"
        type="number"
        value={amount}
        onChange={(e) => onUpdate(+e.target.value, action)}
      />
      {action == 1 ? (
        <div style={{fontSize:'10px', marginBottom:'5px'}}>
          MAX{" "}
          <input style={{position:'relative', top:'2px'}}  type="checkbox" 
          checked={max}
          onChange={(e) =>  onUpdate(+e.target.value, 2)} />
        </div>
      ): (
        <div style={{height: '25px'}}></div>
      )}

      <Button ready={ready} onClick={() => onClick(action)}>
        {text}
      </Button>
    </div>
  );
};

export default Action;
