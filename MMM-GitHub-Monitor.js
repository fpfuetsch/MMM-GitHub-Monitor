Module.register('MMM-GitHub-Monitor', {
  defaults: {
    updateInterval: 1000 * 60 * 10,
    repositories: [
      {
        owner: 'BrainConverter',
        name: 'MMM-GitHub-Monitor',
        pulls: {
          show: true,
          state: 'open',
          head: '',
          base: 'main',
          sort: 'created',
          direction: 'desc',
          topCount: 10,
          maxTitleLength: 100,
        }
      },
    ],
    sort: true,
  },

  getStyles: function () {
    return [
      this.file('MMM-GitHub-Monitor.css'),
      'font-awesome.css'
    ];
  },

  start: function () {
    Log.log('Starting module: ' + this.name);
    this.updateCycle();
    setInterval(this.updateCycle, this.config.updateInterval);
  },

  updateCycle: async function () {
    this.ghData = [];
    await this.updateData();
    this.updateDom();
  },

  updateData: async function () {
    for (repo of this.config.repositories) {
      const resBase = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`)
      if (resBase.ok) {
        const jsonBase = await resBase.json();
        const repoData = {
          title: `${repo.owner}/${repo.name}`,
          stars: jsonBase.stargazers_count,
          forks: jsonBase.forks_count,
        }

        if (repo.pulls && repo.pulls.show) {
          const pullsConfig = {
            state: repo.pulls.state || 'open',
            head: repo.pulls.head,
            base: repo.pulls.base,
            sort: repo.pulls.sort || 'created',
            direction: repo.pulls.direction || 'desc',
          }
          let params = [];
          Object.keys(pullsConfig).forEach(key => {
            if (pullsConfig[key]) {
              params.push(`${key}=${pullsConfig[key]}`)
            }
          });
          const resPulls = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/pulls?${params.join('&')}`)
          if (resPulls.ok) {
            let jsonPulls = await resPulls.json();
            if (repo.pulls.topCount) {
              jsonPulls = jsonPulls.slice(0, repo.pulls.topCount);
            }
            if (repo.pulls.maxTitleLength) {
              jsonPulls.forEach(pull => {
                pull.title = pull.title.substr(0, repo.pulls.maxTitleLength) + "...";
              })
            }
            repoData.pulls = jsonPulls;
          }
        }
        this.ghData.push(repoData)
      }
    }
    if (this.config.sort) {
      this.ghData.sort((r1, r2) => r1.title > r2.title);
    }
  },

  getDom: function () {
    let table = document.createElement('table');
    table.classList.add('gh-monitor');

    this.ghData.forEach(function (repo) {
      let basicRow = document.createElement('tr');
      basicRow.style.fontWeight = 'bold';
      basicRow.style.paddingBottom = '0.5em';

      let title = document.createElement('td');
      title.innerText = repo.title;

      let stars = document.createElement('td');
      stars.innerHTML = `<i class="fa fa-star"></i> ${repo.stars}`;
      stars.style.textAlign = 'left';

      let forks = document.createElement('td');
      forks.innerHTML = `<i class="fa fa-code-fork"></i> ${repo.forks}`;
      forks.style.textAlign = 'left';

      basicRow.append(title);
      basicRow.append(stars);
      basicRow.append(forks)
      table.append(basicRow);

      if (repo.pulls) {
        repo.pulls.forEach(pull => {
          const pullRow = document.createElement('tr');

          const pullEntry = document.createElement('td');
          pullEntry.colSpan = 3;
          pullEntry.innerText = `#${pull.number} ${pull.title}`;
          pullRow.append(pullEntry);
          table.append(pullRow);
        });
      }
    })
    return table;
  }
});
