export default function ProgressModal({open,text}){

  if(!open) return null;

  return(

    <div className="modal">

      <div className="modal-box">

        <div className="spinner"/>

        <p>{text}</p>

      </div>

    </div>

  );

}