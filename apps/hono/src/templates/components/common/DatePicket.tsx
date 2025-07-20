import { type FC } from "hono/jsx"

export const DatePicker: FC<{ label: string, name: string }> = ({ label, name }) => {
  return (
    <div 
      x-data="{
        datePickerOpen: false,
        datePickerValue: '',
        datePickerFormat: 'M d, Y',
        datePickerMonth: '',
        datePickerYear: '',
        datePickerDay: '',
        datePickerDaysInMonth: [],
        datePickerBlankDaysInMonth: [],
        datePickerMonthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datePickerDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datePickerDayClicked(day) {
          let selectedDate = new Date(this.datePickerYear, this.datePickerMonth, day);
          this.datePickerDay = day;
          this.datePickerValue = this.datePickerFormatDate(selectedDate);
          this.datePickerIsSelectedDate(day);
          this.datePickerOpen = false;
        },
        datePickerPreviousMonth(){
          if (this.datePickerMonth == 0) { 
              this.datePickerYear--; 
              this.datePickerMonth = 12; 
          } 
          this.datePickerMonth--;
          this.datePickerCalculateDays();
        },
        datePickerNextMonth(){
          if (this.datePickerMonth == 11) { 
              this.datePickerMonth = 0; 
              this.datePickerYear++; 
          } else { 
              this.datePickerMonth++; 
          }
          this.datePickerCalculateDays();
        },
        datePickerIsSelectedDate(day) {
          const d = new Date(this.datePickerYear, this.datePickerMonth, day);
          return this.datePickerValue === this.datePickerFormatDate(d) ? true : false;
        },
        datePickerIsToday(day) {
          const today = new Date();
          const d = new Date(this.datePickerYear, this.datePickerMonth, day);
          return today.toDateString() === d.toDateString() ? true : false;
        },
        datePickerCalculateDays() {
          let daysInMonth = new Date(this.datePickerYear, this.datePickerMonth + 1, 0).getDate();
          // find where to start calendar day of week
          let dayOfWeek = new Date(this.datePickerYear, this.datePickerMonth).getDay();
          let blankdaysArray = [];
          for (var i = 1; i <= dayOfWeek; i++) {
              blankdaysArray.push(i);
          }
          let daysArray = [];
          for (var i = 1; i <= daysInMonth; i++) {
              daysArray.push(i);
          }
          this.datePickerBlankDaysInMonth = blankdaysArray;
          this.datePickerDaysInMonth = daysArray;
        },
        datePickerFormatDate(date) {
          let formattedDay = this.datePickerDays[date.getDay()];
          let formattedDate = ('0' + date.getDate()).slice(-2); // appends 0 (zero) in single digit date
          let formattedMonth = this.datePickerMonthNames[date.getMonth()];
          let formattedMonthShortName = this.datePickerMonthNames[date.getMonth()].substring(0, 3);
          let formattedMonthInNumber = ('0' + (parseInt(date.getMonth()) + 1)).slice(-2);
          let formattedYear = date.getFullYear();

          if (this.datePickerFormat === 'M d, Y') {
            return `${formattedMonthShortName} ${formattedDate}, ${formattedYear}`;
          }
          if (this.datePickerFormat === 'MM-DD-YYYY') {
            return `${formattedMonthInNumber}-${formattedDate}-${formattedYear}`;
          }
          if (this.datePickerFormat === 'DD-MM-YYYY') {
            return `${formattedDate}-${formattedMonthInNumber}-${formattedYear}`;
          }
          if (this.datePickerFormat === 'YYYY-MM-DD') {
            return `${formattedYear}-${formattedMonthInNumber}-${formattedDate}`;
          }
          if (this.datePickerFormat === 'D d M, Y') {
            return `${formattedDay} ${formattedDate} ${formattedMonthShortName} ${formattedYear}`;
          }
          
          return `${formattedMonth} ${formattedDate}, ${formattedYear}`;
        },
      }" 
      x-init="
        currentDate = new Date();
        if (datePickerValue) {
            currentDate = new Date(Date.parse(datePickerValue));
        }
        datePickerMonth = currentDate.getMonth();
        datePickerYear = currentDate.getFullYear();
        datePickerDay = currentDate.getDay();
        datePickerValue = datePickerFormatDate( currentDate );
        datePickerCalculateDays();
      " 
      x-cloak
    >
      <label for={name} class="bloc">
        { label }
      </label>
      <div class="relative">
        <input 
          id={name}
          name={name}
          x-ref="datePickerInput"
          type="text"
          x-on:click="datePickerOpen=!datePickerOpen"
          x-model="datePickerValue"
          {
            ...{
              "x-on:keydown.escape": "datePickerOpen=false"
            }
          }
          class="flex"
          placeholder="Select date"
          readonly
        />
        
        <div  
          x-show="datePickerOpen"
          {
            ...{
              'x-transition': '',
              "x-on:click.away": "datePickerOpen = false"
            }
          }
          class="absolute top-[100%] left-0 max-w-lg antialiased z-10 bg-white"
        >
          <div class="flex items-center justify-between mb-2">
            <div>
              <span x-text="datePickerMonthNames[datePickerMonth]"></span>
              <span x-text="datePickerYear"></span>
            </div>
            <div>
              <button x-on:click="datePickerPreviousMonth()" type="button" class="inline-flex">
                <svg class="inline-flex w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button x-on:click="datePickerNextMonth()" type="button" class="inline-flex">
                <svg class="inline-flex w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-7 mb-3">
            <template x-for="(day, index) in datePickerDays">
              <div class="px-0.5">
                  <div x-text="day"></div>
              </div>
            </template>
          </div>
          <div class="grid grid-cols-7">
            <template x-for="blankDay in datePickerBlankDaysInMonth">
                <div class="p-1 text-sm text-center border border-transparent"></div>
            </template>
            <template x-for="(day, dayIndex) in datePickerDaysInMonth">
              <div class="px-0.5 mb-1 aspect-square">
                <div 
                  x-text="day"
                  x-on:click="datePickerDayClicked(day)" 
                  x-bind:class="{
                    'bg-neutral-200': datePickerIsToday(day) == true, 
                    'text-gray-600 hover:bg-neutral-200': datePickerIsToday(day) == false && datePickerIsSelectedDate(day) == false,
                    'bg-neutral-800 text-white hover:bg-opacity-75': datePickerIsSelectedDate(day) == true
                  }" 
                  class="flex items-center justify-center text-sm leading-none text-center rounded-full cursor-pointer h-7 w-7"></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  )
}