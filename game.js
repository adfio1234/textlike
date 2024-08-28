import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
    constructor() {
        this.max_hp=100;
        this.hp = 100;
        this.Min_damage = 10;
        this.Max_damage = 15;
        this.evade = 10;
        this.critical=10;
    }

    attack() {
        // 플레이어의 공격
        Monster.hp -= Math.random(this.Max_damage - this.Min_damage) + this.Min_damage;
    }
    hit(damage) {
        this.hp -= damage;
    }
    heal(healing)
    {
        if(this.max_hp<this.hp+healing)this.hp=this.max_hp;
        else {this.hp+=healing;}
    }
}

class Monster {
    constructor() {
        this.max_hp=20;
        this.hp = 20;
        this.Min_damage = 5;
        this.Max_damage = 15;
    }
    Set(stage) {
        this.Min_damage += (this.Min_damage * (stage / 10))*(stage/2);
        this.Max_damage += (this.Max_damage * (stage / 10))*(stage/5);
        this.max_hp+=(this.max_hp * (stage / 10));
        this.max_hp+=10*stage;
        this.hp=this.max_hp
    }
    attack() {
        // 몬스터의 공격
        Player.hp -= this.damage;
    }
    hit(damage) {
        this.hp -= damage;
    }
}

function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n======================================== Current Status ========================================`));
    console.log(
        chalk.cyanBright(`| Stage: ${stage + 1} `) +
        chalk.blueBright(
            `| 플레이어 정보 hp: ${player.hp} / ${player.max_hp}  attack: ${player.Min_damage}-${player.Max_damage}`,
        ) +
        chalk.redBright(
            `| 몬스터 정보 hp: ${monster.hp} / ${monster.max_hp} attack: ${monster.Min_damage}-${monster.Max_damage}  |`,
        ),
    );
    console.log(chalk.magentaBright(`================================================================================================\n`));
}

const battle = async (stage, player, monster) => {
    let logs = [];
    let Player_damage = 0;
    let Monster_damage = 0;
    monster.Set(stage);
    while (player.hp > 0) {
        console.clear();
        displayStatus(stage, player, monster);
        logs.forEach((log) => console.log(log));

        console.log(
            chalk.green(
                `\n1. 공격한다 2. 멍 때리기 3.회피한다`,
            ),
        );
        const choice = readlineSync.question('당신의 선택은? ');
        // 플레이어의 선택에 따라 다음 행동 처리

        switch (choice) {
            case '1':// 공격한다.
                {
                    logs.push(chalk.green(`[공격]을 선택하셨습니다.`));

                    //random하게 플레이어와 몬스터의 공격력 할당
                    Player_damage = Math.ceil(Math.random() * (player.Max_damage - player.Min_damage) + (player.Min_damage - 1));
                    Monster_damage = Math.ceil(Math.random() * (monster.Max_damage - monster.Min_damage) + (monster.Min_damage - 1));
                    //소수점 한자리 까지만 표시
                    if(100<Math.random()*100+player.critical)
                    {
                        Player_damage*=2;
                        logs.push(chalk.yellow('크리티컬!!!!'));
                    }

                    //몬스터 공격
                    monster.hit(Player_damage);
                    logs.push(chalk.red(`몬스터에게 ${Player_damage} 데미지 | 몬스터 HP: ${monster.hp}`));

                    //몬스터에게 공격했을시 몬스터의 체력이 0보다 많아야 플레이어를 공격하게
                    if (monster.hp > 0) {
                        player.hit(Monster_damage);
                        logs.push(chalk.red(`플레이어에게 ${Monster_damage} 데미지 | 플레이어 HP: ${player.hp}`));
                    }

                    //플레이어의 체력이 0보다 작거나 같으면 패배
                    if (player.hp <= 0) console.log(chalk.red(`패배`));
                    break;
                }
            case '2'://아무것도 하지 않는다.
                {
                    logs.push(chalk.green(`[멍 때리기]를 선택하셨습니다.`));
                    //random하게 몬스터의 공격력 할당
                    Monster_damage = Math.ceil(Math.random() * (monster.Max_damage - monster.Min_damage) + (monster.Min_damage - 1));

                    //플레이어 공격
                    player.hit(Monster_damage);
                    logs.push(chalk.red(`플레이어에게 ${Monster_damage} 데미지 | 플레이어 HP: ${player.hp}`));

                    //플레이어의 체력이 0보다 작거나 같으면 패배
                    if (player.hp <= 0) console.log(chalk.red(`패배`));
                    break;
                }
            case '3'://회피한다.
                {
                    logs.push(chalk.green(`[회피한다]를 선택하셨습니다.`));

                    //스테이지가 진행할수록 회피 난이도가 올려가고 플레이어의 스텟에따라 회피가 쉬워진다.
                    //회피만 하면 플레이어측의 이득이 없으니까, 체력 회복 옵션 추가.
                    //체력 회복을 랜덤으로 하여 랜덤성 추가

                    //회피성공
                    if (90+stage<Math.random()*100+player.evade) {        
                        let heal_evade=Math.ceil(Math.random()*10+1);             
                        player.heal(heal_evade);
                        if(player.max_hp==player.hp)logs.push(chalk.blue(`회피 성공!!!! 최대체력입니다. | 플레이어 HP: ${player.hp}`));
                        else{logs.push(chalk.blue(`회피 성공!!!! 플레이어의 체력 ${heal_evade} 회복 | 플레이어 HP: ${player.hp}`));}
                    }
                    //회피 실패
                    else {
                        Monster_damage = Math.ceil(Math.random() * (monster.Max_damage - monster.Min_damage) + (monster.Min_damage - 1));
                        player.hit(Monster_damage);
                        logs.push(chalk.red(`플레이어에게 ${Monster_damage} 데미지 | 플레이어 HP: ${player.hp}`));
                    }
                    if (player.hp <= 0) console.log(chalk.red(`패배 하였습니다.`));
                    break;

                }
        }
        //종료조건
        if (monster.hp <= 0) {
            console.log("승리");
            reward(stage,player,monster);

            break;
        }

    }

};
function reward(stage,player,monster)
{
    //console  출력문
    console.log(chalk.green(`\n================== 스테이지 ${stage+1} 클리어 ===================`));
    console.log(
        chalk.cyanBright(`| Stage: ${stage + 1} 휴식처 `) +
        chalk.blueBright(
            `| 플레이어 정보 hp: ${player.hp} attack: ${player.Min_damage}-${player.Max_damage} |`,
        )
    );
    console.log(chalk.green(`========================================================\n`));

    console.log(chalk.blue(`보상을 선택해 주세요.\n\n`));

    console.log(chalk.blue(`1.공격력 1-9 상승 2.체력50% 회복 3.회피력 증가 4.최대 체력10% 증가 5.선택하지 않는다.\n`));
    const choice = readlineSync.question('당신의 선택은? ');
    // 플레이어의 선택에 따라 다음 행동 처리

    switch(choice)
    {
        case '1'://공격력 상승
            {
                let up_damage=Math.ceil(Math.random()*9+1);
                player.Min_damage+=up_damage;
                player.Max_damage+=up_damage;
                break;
            }
        case '2'://체력 50%회복
            {
                let heal_50=Math.ceil(player.max_hp/2);
                player.heal(heal_50);
                break;
            }
        case '3'://회피력 증가
            {
                player.evade+=3;
                break;
            }
        case '4'://최대 체력 증가
            {
                player.hp+=Math.ceil(player.max_hp/10);
                player.max_hp+=Math.ceil(player.max_hp/10);
                
                break;
            }
        case '5':
            {
                break;
            }
    }

};
export async function startGame() {
    console.clear();
    const player = new Player();
    let stage = 0;

    while (stage <= 10) {
        const monster = new Monster(stage);
        await battle(stage, player, monster);
        // 스테이지 클리어 및 게임 종료 조건

        stage++;
    }
}