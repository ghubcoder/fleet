

function destroy(object){

	object.destroy();
}


function bulletContact(body1,body2){

body1.sprite.kill();
body2.sprite.kill();
	

}


function moveFrigates (frigate) {
     accelerateToObject(frigate,ship,60);  
}

function lineDistance( point1, point2 )
{
  var xs = 0;
  var ys = 0;
 
  xs = point2.x - point1.x;
  xs = xs * xs;
 
  ys = point2.y - point1.y;
  ys = ys * ys;
 
  return Math.sqrt( xs + ys );
}


function moveBullet(bullet){

	bullet.body.force.x = Math.cos(bullet.targetAngle) * 400;   
     	bullet.body.force.y = Math.sin(bullet.targetAngle) * 400;

}



