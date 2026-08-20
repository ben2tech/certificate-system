export default function DashboardCard({title,value,color}){

  return(

    <div className="dash-card" style={{borderTop:`5px solid ${color}`}}>

      <h4>{title}</h4>

      <h1>{value}</h1>

    </div>

  );

}