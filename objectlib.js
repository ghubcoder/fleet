function accelerateToObject(obj1, obj2, speed) {
    if (typeof speed === 'undefined') { speed = 30; }

    var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
    obj1.body.rotation = angle + game.math.degToRad(90);  
    if(lineDistance(obj1,obj2)>70){
    	obj1.body.force.x = Math.cos(angle) * speed;     
     	obj1.body.force.y = Math.sin(angle) * speed;
    }
    
   // else{
//	obj1.body.force.x = Math.cos(angle) * -(speed)*2;   
  //      obj1.body.force.y = Math.sin(angle) * -(speed)*2;
    //}
   
}

function destroy(object){

	object.destroy();
}


function bulletContact(bullet,frigate){




bullet.sprite.kill();

}


function createBullet(ship,target,targetGroup,damage,lifetime){

	var bullet = bullets.create(ship.x, ship.y, 'bullet');	
	bullet.scale.set(bulletScale , bulletScale);      	            
	game.physics.p2.enable(bullet,false);
	bullet.body.setCollisionGroup(bulletGroup);	
	bullet.body.collides(targetGroup, bulletContact, this);             	    
	bullet.body.collideWorldBounds = false; 	    
	bullet.body.mass = 0.01;
	var angle = Math.atan2(target.y - ship.y, target.x - ship.x);
	bullet.targetAngle=angle;
	bullet.body.rotation = angle + game.math.degToRad(90);  
	moveBullet(bullet);	    
	bullet.checkWorldBounds = true;
	bullet.outOfBoundsKill = true;	
	bullet.damage=damage;	
	if(ship.key=='bluefrigate'||ship.key=='redfrigate'){
		bullet.turretTracking=0.9;
		bullet.turretSigResolution=0.1;	
	}
	else{
		bullet.turretTracking=0.35;
		bullet.turretSigResolution=6;	
	
	}
	bullet.created=game.time.now;
	bullet.lifetime=lifetime;

	
}



function frigateContact(frigate,bullet){
	
	if(frigate.sprite.shieldActive==false && (frigate.sprite.shieldPoints>0) ){		
		var shield = game.add.graphics(frigate.x,frigate.y);
		shield.lineStyle(1, 0x0000ff);
		shield.drawCircle(0, 0, frigate.sprite.height*1.2);	
		shield.target=frigate;
		shields.add(shield);
		frigate.sprite.shieldActive=true;	
		frigate.sprite.shieldTimeActivation=game.time.now;
		
	}		
	
	
	var chanceFirstStep=Math.pow((bullet.sprite.turretTracking*(bullet.sprite.turretSigResolution / frigate.mass)),2)
	var hitChance = Math.pow(0.5,chanceFirstStep);
	 
	
	if(Math.random()<hitChance){
		
		var damage=bullet.sprite.damage/(frigate.mass/20);
		var pre;
		var totalHealth = frigate.sprite.shieldPoints+frigate.sprite.armorPoints+frigate.sprite.hullPoints;
		totalHealth = totalHealth-damage;

		if(totalHealth<0){
			frigate.sprite.kill();
		}
		else{	

			pre=frigate.sprite.shieldPoints;
			frigate.sprite.shieldPoints=Math.max((frigate.sprite.shieldPoints-damage),0);
			if(frigate.sprite.shieldPoints===0){
				damage=damage-pre;
				pre=frigate.sprite.armorPoints;
				frigate.sprite.armorPoints=Math.max((frigate.sprite.armorPoints-damage),0);
				damage=damage-pre;
				if(frigate.sprite.armorPoints===0){
					frigate.sprite.hullPoints=Math.max((frigate.sprite.hullPoints-damage),0);		
				}
		
			}
	
			
	
		}
	}

}


function repairShield(ship){
	if((game.time.now-ship.shieldLastCycleTime)>ship.shieldCycleTime){
		ship.shieldPoints=Math.min((ship.shieldPoints+10),100);
		ship.shieldLastCycleTime=game.time.now;
	}
	
}


function constrainVelocity(sprite, maxVelocity) {
  var body = sprite.body
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];
  
  currVelocitySqr = vx * vx + vy * vy;
  
  if (currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx);
    
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    
    body.data.velocity[0] = vx;
    body.data.velocity[1] = vy;
  }



};


function moveFrigates (frigate) {
     if(frigate.target!=null){
     	accelerateToObject(frigate,frigate.target,60);  
    
     }
     
     constrainVelocity(frigate,maxVelocity);
}

function moveShield(shield){
	
	if(shield.target.sprite===null){
		shield.destroy();
	}
	else{	
	if((game.time.now-shield.target.sprite.shieldTimeActivation)>200){
		shield.target.sprite.shieldActive=false;
		shield.destroy();		
	}
	else{
		shield.x=shield.target.x;
		shield.y=shield.target.y;
	}
	}
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

	bullet.body.force.x = Math.cos(bullet.targetAngle) * 6;   
     	bullet.body.force.y = Math.sin(bullet.targetAngle) * 6;
     	
     	if((game.time.now-bullet.created)>bullet.lifetime){
     		bullet.kill();
     	}

}

function onDown(object){

	selectedObject=object;
}


function frigateFire(frigate,group,collisionGroup,delay,damage,lifetime){
    //find targets
    if(frigate.target==null){
    	frigate.target = group[0].getRandom();
    }
    else{
    
	    if (frigate.target.alive==true){	    	   
	    	    if((frigate.lastFire==null || (game.time.now-frigate.lastFire)> (delay)/10+ (Math.floor(Math.random() * delay) + 1))){
		    	    //fire!
		    	    frigate.lastFire=game.time.now;	    
		    	    createBullet(frigate, frigate.target,collisionGroup,damage,lifetime);	    
		    	    if(frigate.concentrateFire==false){		    	    
			    	frigate.target = group[0].getRandom();
			    	if(frigate.target==null){
	    				frigate.target = group[1].getRandom();    
	    			}
			    }
		    }
	    }
	    else {
	    	//find new target    	
	    	frigate.target = group[0].getRandom();    
	    	if(frigate.target==null){
	    		frigate.target = group[1].getRandom();    
	    	}	    	
	    	
	    }    
    }

}	
